import { useContext, useEffect, useState } from "react";
import SocketConnectionContext from "../../store/SocketConnectionContext";

export default function NavBar(props) {
	const [selectedMap, setSelectedMap] = useState();
	const {
		id: sessionId,
		userId,
		users,
		socket,
		map
	} = useContext(SocketConnectionContext);

	const mapSelectionHandler = (event) => {
		setSelectedMap(event.target.value);
	};

	useEffect(() => {
		console.log('map option change')
		if (map !== selectedMap) {
			setSelectedMap(map);
		}
	}, [map]);

	useEffect(() => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(
				JSON.stringify({
					id: sessionId,
					userId: userId,
					method: "mapChange",
					map: selectedMap,
				})
			);
		}
	}, [selectedMap, socket]);

	return (
		<div>
			<select value={selectedMap} onChange={mapSelectionHandler}>
				<option value="customs">Customs</option>
				<option value="reserve">Reserve</option>
				<option value="shoreline">Shoreline</option>
			</select>
		</div>
	);
}
