import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import customsMap from "../../img/maps/customs-monkix3.jpg";
import reserveMap from "../../img/maps/reserve-2d.jpg";
import shorelineMap from "../../img/maps/shoreline.jpg";
import lighthouseMap from "../../img/maps/lighthouse-landscape.jpg";
import mapPinBlack from "../../img/icons/map-pin-black.png";
import mapPinRed from "../../img/icons/map-pin-red.png";
import mapPinGreen from "../../img/icons/map-pin-green.png";
import mapPinBlue from "../../img/icons/map-pin-blue.png";
import mapPinPink from "../../img/icons/map-pin-pink.png";
import classes from "./Map.module.css";
import SocketConnectionContext from "../../store/SocketConnectionContext";

const maps = {'customs': customsMap, 'shoreline': shorelineMap, 'reserve': reserveMap, 'lighthouse': lighthouseMap};
const colorIdToPinIcon = {
	0: mapPinBlack,
	1: mapPinRed,
	2: mapPinGreen,
	3: mapPinBlue,
	4: mapPinPink,
}

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
		let newScale = (scale - event.deltaY / 500).toFixed(1);
		if (newScale >= 0.2 && newScale <= 3) {
			setScale((scale - event.deltaY / 500).toFixed(1));
		}
	};

	const imageMouseDownHandler = (event) => {
		let posX = event.pageX;
		let posY = event.pageY;
		setStartCoords({ x: posX, y: posY });
		console.log("pressed", posX, posY);
	};

	const imageTouchDownHandler = (event) => {
		var touch = event.touches[0] || event.changedTouches[0];
		let posX = touch.clientX;
		let posY = touch.clientY;
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

	const imageTouchUpHandler = (event) => {
		var touch = event.touches[0] || event.changedTouches[0];
		let rect = event.target.getBoundingClientRect();
		let posX = touch.clientX;
		let posY = touch.clientY;
		let currX = touch.clientX - rect.left;
		let currY = touch.clientY - rect.top;
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
		console.log(scale);
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
								onTouchStart={imageTouchDownHandler}
								onMouseUp={imageMouseUpHandler}
								onTouchEnd={imageTouchUpHandler}
							/>
							{users.map((user, index) => (
								<img
									key={index}
									src={colorIdToPinIcon[user.pinColorId]}
									// src={mapPinBlack}
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
