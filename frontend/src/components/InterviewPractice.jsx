import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./InterviewPage.css";

// Create an API service layer
const apiService = {
  baseURL: "/api",

  async getQuestions() {
    try {
      const response = await axios.get(`${this.baseURL}/questions`);
      console.log(
        `Fetched ${response.data.questions.length} questions from API`
      );
      return response.data.questions;
    } catch (error) {
      console.error("Error fetching questions:", error);
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(
        "Failed to fetch questions. Please check your connection and try again."
      );
    }
  },

  async analyzeResponse(response, questionId, questionText, sessionId) {
    try {
      // Ensure all values are strings or null
      const responseData = {
        response: String(response || ""),
        question_id: questionId ? String(questionId) : "unknown",
        question_text: questionText ? String(questionText) : "",
        session_id: sessionId ? String(sessionId) : null,
      };

      console.log("Sending request to analyze response:", {
        responseLength: responseData.response.length,
        question_id: responseData.question_id,
        question_text: responseData.question_text.substring(0, 50),
        session_id: responseData.session_id || "null",
      });

      const res = await axios.post(
        `${this.baseURL}/analyze-response`,
        responseData
      );

      if (!res.data || (!res.data.feedback && !res.data.error)) {
        console.error("Invalid response format:", res.data);
        throw new Error("Received invalid response format from the server");
      }

      return res.data;
    } catch (error) {
      console.error("Error analyzing response:", error);
      if (error.response) {
        console.error("API error status:", error.response.status);
        console.error("API error headers:", error.response.headers);
        console.error(
          "API error data:",
          JSON.stringify(error.response.data, null, 2)
        );

        if (error.response.data && error.response.data.details) {
          console.error("Validation errors:", error.response.data.details);
          throw new Error(
            `Request validation failed: ${JSON.stringify(
              error.response.data.details
            )}`
          );
        } else if (error.response.data && error.response.data.error) {
          throw new Error(error.response.data.error);
        }
      }
      throw new Error(
        "Failed to analyze your response. Please try again later."
      );
    }
  },

  async createSession() {
    try {
      const res = await axios.post(`${this.baseURL}/sessions/create`);
      return res.data.session_id;
    } catch (error) {
      console.error("Error creating session:", error);
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("Failed to create session. Please refresh the page.");
    }
  },
};

const InterviewPractice = () => {
  const { sessionId: urlSessionId } = useParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(urlSessionId || null);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [feedback, setFeedback] = useState("");
  const [sentiment, setSentiment] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [questionCompleted, setQuestionCompleted] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  // New states for better UX
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Updated setupSpeechRecognition function with better error handling
  const setupSpeechRecognition = useCallback(() => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setError(
        "Your browser does not support Speech Recognition. Please try using Chrome, Edge, or Safari."
      );
      return null;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US"; // More widely supported locale

    // Keep track of consecutive abort errors and add exponential backoff
    let abortCount = 0;
    let recognitionTimeout;
    let isManualStop = false;

    recognition.onstart = () => {
      console.log("Speech recognition started");
      clearTimeout(recognitionTimeout);
    };

    recognition.onresult = (event) => {
      // Reset abort count on successful results
      abortCount = 0;

      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart + " ";
        }
      }

      if (finalTranscript) {
        setResponse((prev) => prev + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      // Automatically dismiss no-speech errors or handle them silently
      if (event.error === "no-speech") {
        console.log("No speech detected - continuing without error message");
        // Don't show error to user, just log it
        return;
      }

      if (event.error === "aborted") {
        abortCount++;
        console.log(`Abort count: ${abortCount}`);

        // If we've had too many consecutive aborts, pause longer before retrying
        if (abortCount > 3) {
          console.log(
            "Too many consecutive aborts, pausing recognition for longer"
          );
          setError(
            "Speech recognition is having trouble. Trying again in a moment..."
          );

          clearTimeout(recognitionTimeout);
          recognitionTimeout = setTimeout(() => {
            if (isListening && !isManualStop) {
              try {
                recognition.start();
                console.log("Retrying after multiple aborts");
              } catch (e) {
                console.error("Failed to restart after aborts:", e);
              }
            }
          }, Math.min(2000 * abortCount, 10000)); // Exponential backoff up to 10 seconds

          return;
        }
      } else {
        // Reset abort count for other errors
        abortCount = 0;
        // Only show errors that aren't "no-speech"
        setError(`Speech recognition error: ${event.error}`);
      }

      // For non-fatal errors, try to restart after a short delay
      if (["audio-capture", "network", "aborted"].includes(event.error)) {
        clearTimeout(recognitionTimeout);
        recognitionTimeout = setTimeout(() => {
          if (isListening && !isManualStop) {
            try {
              recognition.start();
            } catch (e) {
              console.error("Failed to restart recognition:", e);
            }
          }
        }, 1000);
      } else {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");

      // Only attempt to restart if not manually stopped and still listening
      if (isListening && !isManualStop) {
        clearTimeout(recognitionTimeout);
        recognitionTimeout = setTimeout(() => {
          if (isListening && !isManualStop) {
            try {
              recognition.start();
              console.log("Restarting recognition after end");
            } catch (e) {
              console.error("Failed to restart recognition:", e);
              setIsListening(false);
            }
          }
        }, 1000); // Longer delay before restarting to prevent rapid cycling
      }
    };

    // Method to properly stop recognition
    recognition.stopSafely = () => {
      isManualStop = true;
      clearTimeout(recognitionTimeout);
      try {
        recognition.stop();
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
      setTimeout(() => {
        isManualStop = false;
      }, 1000);
    };

    return recognition;
  }, [isListening]);

  // Audio visualization setup
  const setupAudioVisualization = useCallback(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("Media devices not supported");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateAudioLevel = () => {
          if (!isListening) return;

          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(average);

          requestAnimationFrame(updateAudioLevel);
        };

        updateAudioLevel();

        return () => {
          stream.getTracks().forEach((track) => track.stop());
          microphone.disconnect();
        };
      })
      .catch((err) => {
        console.error("Error accessing microphone:", err);
      });
  }, [isListening]);

  const submitResponse = useCallback(
    async (responseText) => {
      if (!responseText || !responseText.trim()) {
        setError("Please provide a valid response before submitting.");
        return;
      }

      // Stop listening before submitting to prevent no-speech errors
      setIsListening(false);
      const recognitionInstance = setupSpeechRecognition();
      if (recognitionInstance) {
        recognitionInstance.stopSafely();
      }

      setIsLoading(true);
      setError(null);
      setFeedback("");
      setSentiment(null);

      try {
        // Get the current question ID and text
        const currentQuestion = selectedQuestions[currentQuestionIndex];
        // Ensure question_id is always a string
        const questionId = String(
          currentQuestion?.id || `question_${currentQuestionIndex + 1}`
        );
        const questionText = String(
          currentQuestion?.text || "Unknown question"
        );

        // Ensure text is properly trimmed and not empty
        const trimmedResponse = responseText.trim();
        if (!trimmedResponse) {
          setError("Please provide a non-empty response before submitting.");
          setIsLoading(false);
          return;
        }

        console.log(`Submitting response for question: ${questionText}`);

        const result = await apiService.analyzeResponse(
          trimmedResponse,
          questionId,
          questionText,
          sessionId ? String(sessionId) : null
        );

        console.log("API response:", result);

        // Check if the response contains feedback
        if (result && result.feedback) {
          setFeedback(result.feedback);
          if (result.sentiment) {
            setSentiment(result.sentiment);
          } else {
            // Default sentiment if not provided
            setSentiment({ label: "neutral", score: 0.5 });
          }
          setQuestionCompleted(true);
        } else {
          // Handle case where feedback is missing
          console.error("No feedback in response:", result);
          setError(
            "Could not retrieve feedback. Please try again with a different response."
          );
        }
      } catch (error) {
        console.error("Error analyzing response:", error);

        // Extract error message from the API response if available
        let errorMessage = "Failed to analyze your response. Please try again.";
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [currentQuestionIndex, selectedQuestions, sessionId, setupSpeechRecognition]
  );

  const handleRecordingButton = useCallback(() => {
    if (!interviewStarted) {
      setInterviewStarted(true);
    } else if (!isListening) {
      setIsListening(true);
      setError(null); // Clear any previous errors
      const recognitionInstance = setupSpeechRecognition();
      if (recognitionInstance) {
        try {
          recognitionInstance.start();
          console.log("Recognition started manually");
        } catch (e) {
          console.error("Error starting recognition:", e);
          // If already started, stop and restart
          if (e.message.includes("already started")) {
            try {
              recognitionInstance.stopSafely();
              setTimeout(() => {
                try {
                  recognitionInstance.start();
                } catch (innerE) {
                  console.error("Error in delayed start:", innerE);
                }
              }, 500);
            } catch (stopError) {
              console.error("Error in stop-restart sequence:", stopError);
            }
          }
        }
      }
    } else {
      setIsListening(false);
      const recognitionInstance = setupSpeechRecognition();
      if (recognitionInstance) {
        recognitionInstance.stopSafely();
      }
      if (response.trim()) {
        submitResponse(response);
      } else {
        setError("Please provide a response before submitting.");
      }
    }
  }, [
    interviewStarted,
    isListening,
    response,
    submitResponse,
    setupSpeechRecognition,
  ]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      // Move to next question index
      setCurrentQuestionIndex(currentQuestionIndex + 1);

      // Stop any active speech recognition
      const recognitionInstance = setupSpeechRecognition();
      if (recognitionInstance) {
        recognitionInstance.stopSafely();
      }

      // Reset state for new question
      setResponse("");
      setError(null);
      setFeedback("");
      setSentiment(null);
      setQuestionCompleted(false);
      setIsListening(false);

      console.log(
        `Moving to question ${currentQuestionIndex + 2} of ${
          selectedQuestions.length
        }`
      );
    } else {
      // Interview is complete
      setInterviewCompleted(true);
      console.log("Interview completed");
    }
  }, [currentQuestionIndex, selectedQuestions.length, setupSpeechRecognition]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      // Move to previous question index
      setCurrentQuestionIndex(currentQuestionIndex - 1);

      // Stop any active speech recognition
      const recognitionInstance = setupSpeechRecognition();
      if (recognitionInstance) {
        recognitionInstance.stopSafely();
      }

      // Reset state for new question
      setResponse("");
      setError(null);
      setFeedback("");
      setSentiment(null);
      setQuestionCompleted(false);
      setIsListening(false);

      console.log(
        `Moving back to question ${currentQuestionIndex} of ${selectedQuestions.length}`
      );
    }
  }, [currentQuestionIndex, setupSpeechRecognition]);

  const handleKeyboardShortcuts = useCallback(
    (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "s":
            e.preventDefault();
            handleRecordingButton();
            break;
          case "n":
            e.preventDefault();
            handleNextQuestion();
            break;
          case "p":
            e.preventDefault();
            handlePreviousQuestion();
            break;
          default:
            break;
        }
      }
    },
    [handleRecordingButton, handleNextQuestion, handlePreviousQuestion]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardShortcuts);
    return () => {
      window.removeEventListener("keydown", handleKeyboardShortcuts);
    };
  }, [handleKeyboardShortcuts]);

  // Create a session if needed
  useEffect(() => {
    const initializeSession = async () => {
      if (!sessionId) {
        try {
          const newSessionId = await apiService.createSession();
          setSessionId(newSessionId);
          console.log("Created new session:", newSessionId);
        } catch (error) {
          console.error("Error creating session:", error);
          setError(
            "Failed to initialize interview session. Please refresh and try again."
          );
        }
      }
    };

    initializeSession();
  }, [sessionId]);

  // Fetch questions with better error handling
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const questionsData = await apiService.getQuestions();

        // Ensure we have questions to display
        if (!questionsData || questionsData.length === 0) {
          throw new Error("No questions available");
        }

        // Randomly pick 5 questions
        const shuffledQuestions = [...questionsData].sort(
          () => 0.5 - Math.random()
        );
        const randomQuestions = shuffledQuestions.slice(0, 5);

        // Process questions into a consistent format
        const formattedQuestions = randomQuestions.map((q, index) => {
          // If question is already an object with id and text
          if (q && typeof q === "object" && q.text) {
            return {
              id: q.id || `question_${index + 1}`,
              text: q.text,
            };
          }
          // If question is just a string
          else if (typeof q === "string") {
            return {
              id: `question_${index + 1}`,
              text: q,
            };
          }
          // Fallback for any other format
          return {
            id: `question_${index + 1}`,
            text: `Question ${index + 1}`,
          };
        });

        console.log(
          `Selected ${formattedQuestions.length} questions for the interview:`,
          formattedQuestions.map((q) => q.id)
        );

        setSelectedQuestions(formattedQuestions);

        // Set the current question as the first question
        if (formattedQuestions.length > 0) {
          setQuestion(formattedQuestions[0]);
        }
      } catch (error) {
        console.error("Error loading questions:", error);
        setError(
          "Failed to load interview questions. Please refresh and try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Update current question when currentQuestionIndex changes
  useEffect(() => {
    if (
      selectedQuestions.length > 0 &&
      currentQuestionIndex < selectedQuestions.length
    ) {
      setQuestion(selectedQuestions[currentQuestionIndex]);
      console.log(
        `Showing question ${currentQuestionIndex + 1}: ${
          selectedQuestions[currentQuestionIndex]?.text
        }`
      );
    }
  }, [selectedQuestions, currentQuestionIndex]);

  useEffect(() => {
    const recognitionInstance = setupSpeechRecognition();

    if (recognitionInstance) {
      try {
        recognitionInstance.start();
      } catch (e) {
        console.error("Error starting recognition:", e);
        setError("Failed to start speech recognition. Please try again.");
      }
    }

    // Cleanup function
    return () => {
      if (recognitionInstance) {
        try {
          recognitionInstance.stopSafely();
        } catch (e) {
          console.error("Error stopping recognition:", e);
        }
      }
    };
  }, [interviewStarted, setupSpeechRecognition, isListening]);

  // Handle audio visualization
  useEffect(() => {
    if (isListening) {
      const cleanup = setupAudioVisualization();
      return cleanup;
    }
  }, [isListening, setupAudioVisualization]);

  // Handle viewing comprehensive feedback
  const handleViewComprehensiveFeedback = () => {
    if (sessionId) {
      navigate(`/feedback/${sessionId}`);
    } else {
      setError("Session ID not found. Please try again.");
    }
  };

  // Handle viewing all sessions
  const handleViewAllSessions = () => {
    navigate("/sessions");
  };

  // Add scroll detection for fade effect
  useEffect(() => {
    // Function to check if an element is scrollable
    const checkScrollable = () => {
      const containers = document.querySelectorAll(
        ".response-container, .feedback-container"
      );

      containers.forEach((container) => {
        // Check if content height is greater than container height
        if (container.scrollHeight > container.clientHeight) {
          container.classList.add("scrollable");
        } else {
          container.classList.remove("scrollable");
        }
      });
    };

    // Initial check
    checkScrollable();

    // Check when content changes
    const observer = new MutationObserver(checkScrollable);

    // Observe changes in the interview container
    const interviewContainer = document.querySelector(".interview-container");
    if (interviewContainer) {
      observer.observe(interviewContainer, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    // Check on window resize
    window.addEventListener("resize", checkScrollable);

    // Cleanup
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkScrollable);
    };
  }, [response, feedback]); // Re-run when response or feedback changes

  return (
    <div className="interview-container" role="main">
      <h1>SSB Interview Practice</h1>

      {isLoading && (
        <div className="loading-indicator" role="status">
          Loading...
        </div>
      )}

      {error && (
        <div className="error-message" role="alert">
          {error}
          <button className="dismiss-button" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {interviewStarted && !interviewCompleted && (
        <div className="questions-counter" aria-live="polite">
          Question {currentQuestionIndex + 1} of {selectedQuestions.length}
        </div>
      )}

      {interviewCompleted ? (
        <div className="interview-completed">
          <h2>Interview Completed!</h2>
          <p>
            Thank you for completing the interview. You can now view your
            comprehensive feedback.
          </p>

          <div className="feedback-options">
            <button
              className="comprehensive-feedback-button"
              onClick={handleViewComprehensiveFeedback}
            >
              View Comprehensive Feedback
            </button>

            <button
              className="view-sessions-button"
              onClick={handleViewAllSessions}
            >
              View All Sessions
            </button>

            <button
              className="new-interview-button"
              onClick={() => {
                setInterviewStarted(false);
                setInterviewCompleted(false);
                setSessionId(null);
                setCurrentQuestionIndex(0);
                setResponse("");
                setFeedback("");
                setSentiment(null);
                setQuestionCompleted(false);
                // This will trigger the useEffect to create a new session
              }}
            >
              Start New Interview
            </button>
          </div>
        </div>
      ) : (
        <>
          {question && (
            <div className="question-container" aria-live="polite">
              <h2>Question {currentQuestionIndex + 1}:</h2>
              <p>
                {question.text ||
                  (typeof question === "string" ? question : "")}
              </p>
            </div>
          )}

          <div className="action-container">
            <button
              className={`button answer-button ${
                isListening ? "recording" : ""
              } ${isLoading ? "disabled" : ""}`}
              onClick={handleRecordingButton}
              disabled={isLoading}
              aria-label={
                isListening
                  ? "Stop recording"
                  : interviewStarted
                  ? "Start recording"
                  : "Start interview"
              }
            >
              {isListening
                ? "Done"
                : interviewStarted
                ? "Answer"
                : "Start Interview"}
            </button>

            {interviewStarted && (
              <div className="keyboard-shortcuts">
                Press <kbd>Space</kbd> to start/stop recording, <kbd>Enter</kbd>{" "}
                for next question
              </div>
            )}
          </div>

          {isListening && (
            <div className="listening-indicator" aria-live="polite">
              🎤 Listening...
              <div className="audio-level-indicator">
                <div
                  className="audio-level-bar"
                  style={{ width: `${Math.min(audioLevel, 100)}%` }}
                  aria-hidden="true"
                ></div>
              </div>
            </div>
          )}

          {response && (
            <div className="response-container">
              <h2>Your Response:</h2>
              <div className="response-text">{response}</div>
            </div>
          )}

          {feedback && (
            <div className="feedback-container">
              <h2>Feedback:</h2>
              <div
                className={`feedback-text sentiment-${
                  sentiment?.label?.toLowerCase().replace(/\s+/g, "-") ||
                  "neutral"
                }`}
              >
                {feedback}
              </div>

              {sentiment && (
                <div className="sentiment-indicator">
                  <span>Sentiment: {sentiment.label}</span>
                  <span>
                    Confidence: {((sentiment.score || 0.5) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )}

          {questionCompleted && (
            <div className="navigation-container">
              {currentQuestionIndex + 1 < selectedQuestions.length ? (
                <button
                  className="next-button"
                  onClick={handleNextQuestion}
                  aria-label="Proceed to next question"
                >
                  Next Question →
                </button>
              ) : (
                <button
                  className="finish-button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to finish the interview?"
                      )
                    ) {
                      setInterviewCompleted(true);
                    }
                  }}
                  aria-label="Finish interview"
                >
                  Finish
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InterviewPractice;
