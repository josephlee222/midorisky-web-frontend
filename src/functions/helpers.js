// Only use this when there is a context
import { useContext } from "react";
import { AppContext } from "../App";

export default function titleHelper(title, docTitle=null) {
    const { setTitle } = useContext(AppContext);
    document.title = (docTitle ? docTitle : title) + " | MidoriSKY";
    setTitle(title);
}