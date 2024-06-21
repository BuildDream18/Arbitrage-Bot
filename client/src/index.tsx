import "./index.css"
import App from "./App"
import { BrowserRouter as Router } from "react-router-dom"
import {createRoot} from "react-dom/client"
import * as React from "react"

const container = document.getElementById('root');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
    <React.StrictMode>
        <Router>
            <App/>
        </Router>
    </React.StrictMode>
);
// ReactDOM.render(
//     <React.StrictMode>
//         <Router>
//             <App/>
//         </Router>
//     </React.StrictMode>,
//     document.getElementById("root")
// )
