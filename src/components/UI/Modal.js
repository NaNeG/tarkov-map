import { Fragment, useRef } from "react";
import classes from "./Modal.module.css";

export default function Modal(props) {
  const inputRef = useRef();

  const formSubmitHandler = (event) => {
		event.preventDefault();
		props.onSetUsername(inputRef.current.value);
	}

	return (
		<Fragment>
			<div
				className={classes.backdrop}
				onClick={props.onClose}
			></div>
			<form className={classes.modal} onSubmit={formSubmitHandler}>
				<label>Username</label>
				<input name="username" ref={inputRef}></input>
        <button type="submit">Submit</button>
			</form>
		</Fragment>
	);
}
