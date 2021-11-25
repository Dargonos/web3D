import React from "react";
import ReactDOM from "react-dom";
import ProductScene from "./Component/ProductScene";
import "./App.css";


function App() {
  return (
      <div className="App">
          <ProductScene/>
      </div>
  );
}

export default App;

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);