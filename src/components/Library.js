import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import albumData from './../data/albums';

class Library extends Component {
  constructor(props) {
    super(props);
    this.state = { albums: albumData };
  }

  render() {
    return (
      <section id='library-page' className="container">
        <div id="album-container">
          {
            this.state.albums.map( (album, index) =>
              <Link to={`/album/${album.slug}`} key={index} className="album-link">
                  <div className="album-card">
                    <img src={album.albumCover} alt={album.title} />
                    <div>{album.title}</div>
                    <div>{album.artist}</div>
                  </div>
              </Link>
            )
          }
        </div>
      </section>
    );
  }
}

export default Library;