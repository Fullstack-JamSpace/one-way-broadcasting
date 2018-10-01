import React, {Component} from 'react'
import {Dropdown} from 'react-bootstrap'
import {config} from './stream-config'

class Streamer extends Component {

  render() {
    return (
      <div>
        <article>
          <header>
            <h1>Streamer</h1>
          </header>
          <section className="experiment">
            <section>
              <Dropdown.Menu id="broadcasting-option">
                <Dropdown.Item>Audio + Video</Dropdown.Item>
                <Dropdown.Item>Only Audio</Dropdown.Item>
                <Dropdown.Item>Screen</Dropdown.Item>
              </Dropdown.Menu>
              <input type="text" id="broadcast-name"></input>
              <button id="setup-new-broadcast" className="setup">Setup New Broadcast</button>
            </section>
            <table id="rooms-list"></table>
            <div id="videos-container"></div>
          </section>
        </article>
      </div>
    )
  }
}
 

export default Streamer