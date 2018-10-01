import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import './App.css';

class Main extends Component {
  render () {
    return (
      <div className="App">
        <Streamer /> 
      </div>
    )
  }
}

ReactDOM.render(
  <Main />,
  document.getElementById('app')
)
