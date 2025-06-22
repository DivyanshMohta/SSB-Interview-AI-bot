import "./base.css";
import "./SSBResourcesSection.css";

// eslint-disable-next-line react/prop-types
function ResourceCard({ icon, title, items }) {
  return (
    <div className="resource-card">
      <div className="resource-icon">
        <img src={icon} alt={title} />
      </div>
      <h3>{title}</h3>
      <div className="resource-details">
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <button className="resource-btn">View</button>
    </div>
  );
}

function SSBResourcesSection() {
  const resources = [
    {
      icon: "https://img.icons8.com/fluency/96/communication-skill.png",
      title: "📧 Interview Tips & Tricks",
      items: [
        "Handling tough questions",
        "Body language tips",
        "Common pitfalls to avoid",
      ],
    },
    {
      icon: "https://img.icons8.com/fluency/96/medal.png",
      title: "Officer-Like Qualities",
      items: [
        "15 OLQs explained",
        "Development strategies",
        "Assessment criteria",
      ],
    },
    {
      icon: "https://img.icons8.com/fluency/96/test.png",
      title: "GTO & Psychological Tests",
      items: [
        "Test preparation guides",
        "Practice exercises",
        "Time management tips",
      ],
    },
    {
      icon: "https://img.icons8.com/fluency/96/book.png",
      title: "Recommended Books",
      items: ["Curated book list", "Online resources", "Study planners"],
    },
    {
      icon: "https://img.icons8.com/fluency/96/news.png",
      title: "Latest SSB Updates",
      items: ["Exam notifications", "Eligibility updates", "Important dates"],
    },
    {
      icon: "https://img.icons8.com/fluency/96/youtube-play.png",
      title: "YouTube Video Guides",
      items: ["Mock interviews", "Expert insights", "Preparation tips"],
    },
    {
      icon: "https://img.icons8.com/fluency/96/podcast.png",
      title: "SSB Prep Podcasts",
      items: [
        "Ex-SSB officer interviews",
        "Success stories",
        "Expert discussions",
      ],
    },
    {
      icon: "https://img.icons8.com/fluency/96/quiz.png",
      title: "Daily Practice & Case Studies",
      items: [
        "Problem-solving exercises",
        "Real-life case studies",
        "Decision-making scenarios",
      ],
    },
  ];

  return (
    <section className="ssb-resources">
      <div className="section-header">
        <h2>SSB Preparation Resources</h2>
        <p>Comprehensive guides and materials for your SSB success</p>
      </div>

      <div className="resources-grid">
        {resources.map((resource, index) => (
          <ResourceCard
            key={index}
            icon={resource.icon}
            title={resource.title}
            items={resource.items}
          />
        ))}
      </div>
    </section>
  );
}

export default SSBResourcesSection;
