import '../Css/ArtPage.css'
import { useState, useEffect } from 'react'
import { artworks } from '../Media'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import Masonry from 'react-responsive-masonry'

function ArtPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="ArtPage">
        <h1 className="art-title">Personal Work</h1>
        <p>Please be patient as the content of this page loads.</p>
        <div className="spin-container">
          <Spin
            indicator={
              <LoadingOutlined
                style={{
                  fontSize: 50,
                  color: '#FF7A64',
                }}
                spin
              />
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="ArtPage">
      <h1 className="art-title">Personal Work</h1>
      {loading && <p>Please be patient as the content of this page loads.</p>}
      <div className="art-content">
        <Masonry columnsCount={3} gutter="10px">
          {artworks?.map((art, index) => (
            <img key={index} className="artwork" src={art.path} alt={art.alt} />
          ))}
        </Masonry>
      </div>
    </div>
  )
}

export default ArtPage
