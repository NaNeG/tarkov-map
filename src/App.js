import React, { Fragment, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useRoutes } from "react-router-dom";
import Map from "./components/Map/Map";
import NavBar from "./components/UI/NavBar";
import Modal from "./components/UI/Modal";
import "./global.css";
import SocketConnection from "./components/Middleware/SocketConnection";
import SocketConnectionProvider from "./store/SocketConnectionProvider";

function App() {
	const [username, setUsername] = useState('');
	const [isModalShown, setIsModalShown] = useState(true);

	const setUsernameHandler = (username) => {
		setUsername(username);
		setIsModalShown(false);
	}

	const modalCloseHandler = () => {
		setIsModalShown(false);
	}

	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/"
					element={
						<Navigate
							replace
							to={`f${(+new Date()).toString(16)}`}
						></Navigate>
					}
				></Route>
				<Route
					path="/:id"
					element={
						<SocketConnectionProvider>
							{isModalShown && <Modal onClose={modalCloseHandler} onSetUsername={setUsernameHandler}></Modal>}
							<NavBar />
							<Map username={username}/>
						</SocketConnectionProvider>
					}
				></Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
