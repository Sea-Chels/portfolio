import '../Css/LandingPage.css'
import { GithubOutlined, ArrowRightOutlined, ExperimentOutlined } from '@ant-design/icons'
import { Modal, Button, Card } from 'antd'
import { useState } from 'react'

interface ProjectItemProps {
  theme: string
  title: string
  alt: string
  path: string
  description: string
  link?: string
  website?: string
}

function ProjectItem({ theme, title, alt, path, description, link, website }: ProjectItemProps) {
  const [modalVisible, setModalVisible] = useState(false)

  const toggleModal = () => {
    setModalVisible(!modalVisible)
  }

  const footerButtons = [
    <Button key="submit" className="card-link" onClick={toggleModal}>
      Close
    </Button>,
  ]

  if (link && !website) {
    footerButtons.push(
      <Button key="github" href={link} className="card-link-primary" target="_blank" rel="noreferrer">
        <GithubOutlined /> View Code
      </Button>
    )
  } else {
    footerButtons.push(
      <Button key="website" className="card-link-primary" href={website} target="_blank" rel="noreferrer">
        <ArrowRightOutlined /> Visit Website
      </Button>
    )
  }

  return (
    <>
      <Card
        className={`${theme} project-card-enhanced`}
        hoverable
        onClick={toggleModal}
        styles={{ body: { padding: 0 } }}
      >
        <div className="card-img-wrapper">
          <img className="card-img-enhanced" src={path} alt={alt} />
          <div className="card-overlay">
            <div className="overlay-content">
              <ExperimentOutlined className="overlay-icon" />
              <span className="overlay-text">View Project</span>
            </div>
          </div>
        </div>
        <div className="card-content">
          <h4 className="card-title-enhanced">{title}</h4>
          <p className="card-desc">{description?.substring(0, 80)}...</p>
        </div>
      </Card>
      <Modal
        open={modalVisible}
        title={title}
        onCancel={toggleModal}
        footer={footerButtons}
        className="project-modal-enhanced"
        width={600}
      >
        <p className="card-left">{description}</p>
        <br></br>
      </Modal>
    </>
  )
}

export default ProjectItem
