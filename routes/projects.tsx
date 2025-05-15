import Layout from "../components/Layout.tsx";
import ProjectCard from "../components/ProjectCard.tsx";

const projects = [
  {
    title: "Project Alpha",
    description: "This is a short description for Project Alpha. It does amazing things using cutting-edge technology. Lorem ipsum dolor sit amet.",
    link: "#"
  },
  {
    title: "Project Beta",
    description: "Project Beta solves a critical problem in a novel way. Built with a focus on performance and scalability. Consectetur adipiscing elit.",
    link: "#"
  },
  {
    title: "Project Gamma",
    description: "An innovative solution for an everyday challenge, Project Gamma aims to simplify complexity. Sed do eiusmod tempor incididunt.",
    link: "#"
  }
];

export default function ProjectsPage() {
  return (
    <Layout>
      <h2>My Projects</h2>
      <div class="projects-grid">
        {projects.map(project => (
          <ProjectCard 
            title={project.title} 
            description={project.description} 
            link={project.link} 
          />
        ))}
      </div>
    </Layout>
  );
} 