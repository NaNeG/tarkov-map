import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";
import Draggable from "react-draggable";
import customsMap from "../../img/maps/customs-monkix3.jpg";
import reserveMap from "../../img/maps/reserve-2d.jpg";
import shorelineMap from "../../img/maps/shoreline.jpg";
import lighthouseMap from "../../img/maps/lighthouse-landscape.jpg";
import mapPin from "../../img/icons/map-pin.png";
import classes from "./Map.module.css";
import SocketConnectionContext from "../../store/SocketConnectionContext";

const maps = {'customs': customsMap, 'shoreline': shorelineMap, 'reserve': reserveMap, 'lighthouse': lighthouseMap};

export default function Map(props) {
	const [scale, setScale] = useState(1);
	const [username, setUsername] = useState("");
	const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });
	const mapRef = useRef();
	const pinRefs = useRef([]);

	const { id: sessionId, userId, users, socket, map } = useContext(SocketConnectionContext);

	useEffect(() => {
		console.log('changed', sessionId, userId, users, socket);
	}, [sessionId, userId, users, socket]);

	useEffect(() => {
		setUsername(props.username);
	}, [props.username]);

	const scrollHandler = (event) => {
		setScale((scale - event.deltaY / 500).toFixed(1));
	};

	const imageMouseDownHandler = (event) => {
		let posX = event.pageX;
		let posY = event.pageY;
		setStartCoords({ x: posX, y: posY });
		console.log("pressed", posX, posY);
	};

	const imageMouseUpHandler = (event) => {
		let rect = event.target.getBoundingClientRect();
		let posX = event.pageX;
		let posY = event.pageY;
		let currX = event.clientX - rect.left;
		let currY = event.clientY - rect.top;
		console.log("released", posX, posY);
		if (
			Math.abs(posX - startCoords.x) === 0 &&
			Math.abs(posY - startCoords.y === 0)
		) {
			// console.log(socket, sessionId, userId, username);
			socket.send(
				JSON.stringify({
					id: sessionId,
					userId: userId,
					method: "pin",
					x: (currX / scale).toFixed(0),
					y: (currY / scale).toFixed(0),
				})
			);

			console.log((currX / scale).toFixed(0), (currY / scale).toFixed(0));
		}
	};

	useEffect(() => {
		console.log('redraw', pinRefs, map);
		for (let userIndex = 0; userIndex < users.length; userIndex++) {	
			if (users[userIndex].pinShown) {
				console.log(users[userIndex], pinRefs.current[userIndex])
				let pinRect =
					pinRefs.current[userIndex].getBoundingClientRect();
				console.log(pinRect.top);
				pinRefs.current[userIndex].style.top = `${
					users[userIndex].coordinates.y -
					(pinRect.height / 2 + pinRect.height / (2 * scale))
				}px`;
				pinRefs.current[userIndex].style.left = `${
					users[userIndex].coordinates.x - pinRect.width / 2
				}px`;
				pinRefs.current[userIndex].style.transform = `scale(${1 / scale})`;
				// console.log('drawn', pinRect.height, pinRect.width);
			}
		}
	}, [scale, users]);

	useEffect(() => {
		mapRef.current.style.transform = `scale(${scale})`;
	}, [scale]);

	return (
		<div
			className={classes.container}
			onWheel={scrollHandler}
			id={"mapContainer"}
		>
			<div>
				<Draggable>
					<div className={classes["draggable-container"]}>
						<div ref={mapRef}>
							<img
								className={classes.map}
								draggable={false}
								src={maps[map]}
								onMouseDown={imageMouseDownHandler}
								onMouseUp={imageMouseUpHandler}
							/>
							{users.map((user, index) => (
								<img
									key={index}
									src={mapPin}
									user={user}
									className={classes.mapPin}
									hidden={!user.pinShown}
									ref={(elem) =>
										(pinRefs.current[index] = elem)
									}
								/>
							))}
						</div>
					</div>
				</Draggable>
			</div>
		</div>
	);
}
