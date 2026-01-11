import { useState, useEffect } from 'react'
import {
  LinkedinOutlined,
  GithubOutlined,
  InstagramOutlined,
  MailOutlined,
  FileTextOutlined,
  CodeOutlined,
  MessageOutlined,
} from '@ant-design/icons'
import aboutHero from '../Media/about-hero.png'
import resume from '../Media/CLSallady_Resume.pdf'

const skills = [
  { name: 'JavaScript/ES6+', category: 'language' },
  { name: 'TypeScript', category: 'language' },
  { name: 'Python', category: 'language' },
  { name: 'React.js', category: 'frontend' },
  { name: 'React Native', category: 'frontend' },
  { name: 'Node.js', category: 'backend' },
  { name: 'Express.js', category: 'backend' },
  { name: 'PostgreSQL', category: 'database' },
  { name: 'MongoDB', category: 'database' },
  { name: 'GraphQL', category: 'backend' },
  { name: 'Apollo', category: 'backend' },
  { name: 'RESTful APIs', category: 'backend' },
  { name: 'AWS Cloud', category: 'devops' },
  { name: 'SAML/SSO Auth', category: 'backend' },
  { name: 'Sequelize', category: 'database' },
  { name: 'Figma', category: 'design' },
  { name: 'Adobe Suite', category: 'design' },
  { name: 'UX/UI Design', category: 'design' },
]

const socialLinks = [
  {
    icon: LinkedinOutlined,
    href: 'https://www.linkedin.com/in/chelby-sallady/',
    label: 'LinkedIn',
  },
  {
    icon: GithubOutlined,
    href: 'https://github.com/Sea-Chels',
    label: 'GitHub',
  },
  {
    icon: InstagramOutlined,
    href: 'https://www.instagram.com/seachels_downunder',
    label: 'Instagram',
  },
  {
    icon: MailOutlined,
    href: 'mailto:csallady.work@gmail.com',
    label: 'Email',
  },
]

function AboutPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const bioText = `Hello, I'm a Full-Stack Software Engineer with an unconventional yet enriching journey. From my roots in design, I've cultivated a unique blend of communication, problem-solving, and creative thinking. As a lead graphic designer, I honed my skills in user-centric design, intertwining form with function to amplify brand narratives and resonate with audiences.

Intrigued by the prospect of merging creativity with technology, I transitioned into software engineering, enrolling in a full-stack web development bootcamp to delve into the intricate world of coding.

Today, I'm dedicated to crafting impactful and user-centric software solutions, driven by the belief that the fusion of design and technology can foster transformative experiences.`

  return (
    <div className="min-h-screen py-16">
      {/* Hero Section */}
      <section
        className={`mb-20 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Section Header */}
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono text-accent text-base">02</span>
          <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-12">
          About Me
        </h1>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Illustration */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border border-[var(--border)]">
              <img
                src={aboutHero}
                alt="Illustration of developer with plants and laptop"
                className="w-full h-auto"
              />
              {/* Decorative corner accent */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-accent rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-accent rounded-br-2xl" />
            </div>
          </div>

          {/* Bio Content */}
          <div>
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <a
                href={resume}
                target="_blank"
                rel="noreferrer"
                className="btn-hacker inline-flex items-center gap-2"
              >
                <FileTextOutlined />
                Resume
              </a>
              <a
                href="#skills"
                className="px-5 py-3 border border-[var(--border)] text-[var(--text-secondary)] font-mono text-sm uppercase tracking-wider hover:border-accent hover:text-accent transition-all duration-300 inline-flex items-center gap-2"
              >
                <CodeOutlined />
                Skills
              </a>
              <a
                href="#contact"
                className="px-5 py-3 border border-[var(--border)] text-[var(--text-secondary)] font-mono text-sm uppercase tracking-wider hover:border-accent hover:text-accent transition-all duration-300 inline-flex items-center gap-2"
              >
                <MessageOutlined />
                Contact
              </a>
            </div>

            {/* Bio Text */}
            <div className="space-y-4">
              {bioText.split('\n\n').map((paragraph, i) => (
                <p
                  key={i}
                  className="text-lg text-[var(--text-secondary)] leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="mb-20 pt-8">
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono text-accent text-base">03</span>
          <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
          Skills & Technologies
        </h2>
        <p className="text-lg text-[var(--text-muted)] mb-12 max-w-2xl">
          A toolkit built through years of design and development experience.
        </p>

        {/* Skills Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {skills.map((skill, index) => (
            <div
              key={skill.name}
              className="group p-4 card-hacker hover:border-accent/50 transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent group-hover:animate-pulse" />
                <span className="text-[var(--text-primary)] font-medium">
                  {skill.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="pt-8">
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono text-accent text-base">04</span>
          <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
          Get In Touch
        </h2>
        <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl leading-relaxed">
          Ready to bring your project to life? Whether you're looking to build a
          web application from scratch, optimize an existing system, or anything
          in between, I'm here to help.
        </p>

        <p className="text-xl text-accent font-display mb-12">
          Let's turn your vision into code!
        </p>

        {/* Social Links */}
        <div className="flex flex-wrap gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 px-6 py-4 border border-[var(--border)] rounded-lg hover:border-accent hover:bg-accent/5 transition-all duration-300"
            >
              <social.icon className="text-2xl text-accent" />
              <span className="text-[var(--text-secondary)] group-hover:text-accent transition-colors">
                {social.label}
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AboutPage
