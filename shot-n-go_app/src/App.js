import logo from './images/logo_2_2-3.webp';
import './App.css';

function App() {
  return (
    <div className="App">
      <head>
        <title>shot'n'go</title>
      </head>
      <body>
      <header className="App-header">
        <div id='logodiv'>
          <img src={logo} id='logoimg'></img>
        </div>
        <div class="title">
          <h1 >Shot'n'go</h1>
        </div>
      </header> 
      </body>
    </div>
  );
}

export default App;
