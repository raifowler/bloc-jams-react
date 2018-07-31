import React, { Component } from 'react';
import albumData from './../data/albums';
import PlayerBar from './PlayerBar';

function IconPlay(props) {
  return (
    <span className="icon ion-md-play"></span>
  );
}

function IconPause(props) {
  return (
    <span className="icon ion-md-pause"></span>
  );
}

function IconNumber(props) {
  return (
    <span>{props.index + 1}</span>
  );
}

class Icon extends Component {
  render () {
    const hover = this.props.hover;
    const isPlaying = this.props.isPlaying;
    const currentSong = this.props.currentSong;
    const hoverSong = this.props.hoverSong;
    const index = this.props.index;
    const song = this.props.song;
    const isSameSong = hoverSong === song;
    const sameSongPlaying = currentSong === song && isPlaying;
    let icon;

    if (hover && isSameSong && !sameSongPlaying) {
      icon = <IconPlay />
    } else if (sameSongPlaying || (currentSong === !null && isPlaying)) {
      icon = <IconPause />
    } else if (currentSong === song && !isPlaying) {
      icon = <IconPlay />
    } else {
      icon = <IconNumber index={index} />
    }

    return (
      <td className="song-number">{icon}</td>
    )
  }
}

class Album extends Component {
  constructor(props) {
    super(props);

    const album = albumData.find( album => {
      return album.slug === this.props.match.params.slug
    });

    this.state = {
      album: album,
      currentSong: null,
      hoverSong: null,
      currentTime: 0,
      duration: album.songs[0].duration,
      isPlaying: false,
      hover: null,
    }; 

    this.audioElement = document.createElement('audio');
    this.audioElement.src = album.songs[0].audioSrc;
    this.audioElement.volume = 0.8;
  }

  componentDidMount() {
    this.eventListeners = {
      timeUpdate: e => {
        this.setState({ currentTime: this.audioElement.currentTime });
      },
      durationChange: e => {
        this.setState({ duration: this.audioElement.duration });
      }
    };
    this.audioElement.addEventListener('timeupdate', this.eventListeners.timeUpdate);
    this.audioElement.addEventListener('durationchange', this.eventListeners.durationChange);
  }

  componentWillUnmount() {
    this.audioElement.src = null;
    this.audioElement.removeEventListener('timeupdate', this.eventListeners.timeUpdate);
    this.audioElement.removeEventListener('durationchange', this.eventListeners.durationChange);
  }

  play() {
    this.audioElement.play();
    this.setState({ isPlaying: true });
  }

  pause() {
    this.audioElement.pause();
    this.setState({ isPlaying: false });
  }

  onMouseOver(song) {
    this.setState({ hover: true });
    this.setState({ hoverSong: song });
  }

  onMouseOut() {
    this.setState({ hover: false });
    this.setState({ hoverSong: null });
  }

  setSong(song) {
    this.audioElement.src = song.audioSrc;
    this.setState({ currentSong: song });
  }

  handleSongClick(song) {
    const isSameSong = this.state.currentSong === song;
    const album = this.state.album.songs;

    if (this.state.currentSong === null && song === null) {
      song = album[0];
      this.setSong(song);
      this.play();
    } else if (this.state.isPlaying && isSameSong) {
      this.pause();
    } else {
      if (!isSameSong) { this.setSong(song); }
      this.play();
    } 
  }

  handlePrevClick() {
    const album = this.state.album.songs;
    const currentIndex = album.findIndex(song => this.state.currentSong === song);
    const newIndex = Math.max(0, currentIndex - 1);
    const newSong = album[newIndex];
    this.setSong(newSong);
    this.play();
  }

  handleNextClick() {
    const album = this.state.album.songs;
    const currentIndex = album.findIndex(song => this.state.currentSong === song);
    const newIndex = Math.min((album.length - 1), currentIndex + 1);
    const newSong = album[newIndex];
    this.setSong(newSong);
    this.play();
  }

  handleTimeChange(e) {
    const newTime = this.audioElement.duration * e.target.value;
    this.audioElement.currentTime = newTime;
    this.setState({ currentTime: newTime });
  }

  handleVolumeChange(e) {
    const maxVolume = 1;
    const newVolume = maxVolume * e.target.value;
    this.audioElement.volume = newVolume;
  }

  formatTime(initTime) {
    const minutes = Math.floor((initTime % 3600) / 60);
    const seconds = Math.floor(initTime % 60);

    let finalTime = "";

    if (Number.isNaN(initTime)) {
      return "-:--"
    }
    finalTime += `${minutes}:${(seconds < 10 ? "0" : "")}`;
    finalTime += `${seconds}`;
    return finalTime;
  }

  render() {
    return (
      <section id="album-page">
        <div id="player-bar-container">
          <PlayerBar 
            isPlaying={this.state.isPlaying} 
            currentSong={this.state.currentSong} 
            currentTime={this.audioElement.currentTime}
            duration={this.audioElement.duration}
            volume={this.audioElement.volume}
            handleSongClick={() => this.handleSongClick(this.state.currentSong)}
            handlePrevClick={() => this.handlePrevClick()}
            handleNextClick={() => this.handleNextClick()}
            handleTimeChange={(e) => this.handleTimeChange(e)}
            formatTime={(initTime) => this.formatTime(initTime)}
            handleVolumeChange={(e) => this.handleVolumeChange(e)}
            songTitle={this.state.album.songs.title}
          />
        </div>
        <div id="album-detail" className="container">
          <img id="album-cover-art" src={this.state.album.albumCover} alt={this.state.album.title}/>
          <div className="album-details">
            <h1 id="album-title">{this.state.album.title}</h1>
            <h2 className="artist">{this.state.album.artist}</h2>
            <div id="release-info">{this.state.album.releaseInfo}</div>
          </div>
          <table id="song-list">
            <colgroup>
              <col id="song-number-column" />
              <col id="song-title-column" />
              <col id="song-duration-column" />
            </colgroup>
            <tbody>
              {
                this.state.album.songs.map( (song, index) =>
                  <tr className="song" key={index} onClick={(e) => {e.preventDefault(); this.handleSongClick(song)}} onMouseEnter={() => this.onMouseOver(song)} onMouseLeave={() => this.onMouseOut()} >
                    <Icon 
                      className="song-number"
                      song={song} 
                      index={index} 
                      hover={this.state.hover} 
                      hoverSong={this.state.hoverSong} 
                      isPlaying={this.state.isPlaying} 
                      currentSong={this.state.currentSong} 
                    />
                    <td className="song-title">{song.title}</td>
                    <td className="song-duration">{this.formatTime(song.duration)}</td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
      </section>  
    );
  }
}

export default Album;