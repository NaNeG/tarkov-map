import SocketConnectionContext from "./SocketConnectionContext";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";

export default function SocketConnectionProvider(props) {
	const [userId, setUserId] = useState(uuid().slice(0, 8));
	const [selectedMap, setSelectedMap] = useState();
	const [users, setUsers] = useState([]);
	const [username, setUsername] = useState("");
	const [sessionId, setSessionId] = useState("");
	const [socket, setSocket] = useState();
	const params = useParams();

	const [value, setValue] = useState({
		id: params.id,
		userId: userId,
		users: users,
		socket: socket,
		map: selectedMap,
	});

	const parseUsers = (msg) => {
		console.log("users set", msg.users);
		setUsers(JSON.parse(JSON.stringify(msg.users)));
	};

	const userActionHandler = (msg) => {
		let currentUserId = msg.userId;
		let currentUserIndex = users.findIndex(
			(user) => user.userId === currentUserId
		);
		console.log(currentUserIndex, users);
		setUsers((state) => [
			...state.slice(0, currentUserIndex),
			{
				...state[currentUserIndex],
				pinShown: true,
				coordinates: { x: Number(msg.x), y: Number(msg.y) },
			},
			...state.slice(currentUserIndex + 1),
		]);
	};

	const changeMap = (msg) => {
		console.log("map selected", msg.map);
		setSelectedMap(msg.map);
	};

	useEffect(() => {
		setSessionId(params.id);
	}, []);

	useEffect(() => {
		setValue({
			id: params.id,
			userId: userId,
			users: users,
			socket: socket,
			map: selectedMap,
		});
		console.log("set", users, params.id, selectedMap);
	}, [params.id, userId, users, socket, selectedMap]);

	useEffect(() => {
		const socket = new WebSocket("wss://tarkov-map-server.herokuapp.com/");
		// const socket = new WebSocket("ws://localhost:5000/");
		setSocket(socket);
		socket.onopen = () => {
			console.log("connected");
			socket.send(
				JSON.stringify({
					id: params.id,
					userId: userId,
					username: username,
					pinShown: false,
					method: "connection",
				})
			);
			setInterval(
				socket.send(
					JSON.stringify({
						id: params.id,
						userId: userId,
						method: "ping",
					})
				),
				15000
			);
			// socket.send(
			// 	JSON.stringify({
			// 		id: params.id,
			// 		userId: userId,
			// 		method: "mapChange",
			// 		map: 'customs',
			// 	})
			// );
		};
		
	}, []);

	useEffect(() => {
		if (socket) {
			socket.onmessage = (event) => {
				let msg = JSON.parse(event.data);
				switch (msg.method) {
					case "connection":
						console.log(`Новый пользователь`, msg);
						parseUsers(msg);
						changeMap(msg);
						break;
					case "pin":
						console.log("pinned", msg);
						userActionHandler(msg);
						break;
					case "disconnect":
						console.log("Disconnect", msg);
						parseUsers(msg);
						break;
					case "mapChange":
						console.log("mapChange", msg);
						parseUsers(msg);
						changeMap(msg);
						break;
				}
			};
		}
	}, [socket, users]);

	return (
		<SocketConnectionContext.Provider value={value}>
			{props.children}
		</SocketConnectionContext.Provider>
	);
}
