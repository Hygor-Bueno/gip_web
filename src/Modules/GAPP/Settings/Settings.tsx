import React, { useState, useEffect } from "react";
import NavBar from "../../../Components/NavBar";
import { listPathGAPP } from "../ConfigGapp";
import SettingsPage from "./SettingsPage";
import { useMyContext } from "../../../Context/MainContext";

const MOBILE_BP = 640;

export default function Settings(): JSX.Element {
  const { setTitleHead } = useMyContext();
  const [navHidden, setNavHidden] = useState(false);

  useEffect(() => {
    setTitleHead({
      title: "Configurações - GAPP",
      simpleTitle: "GAPP - Configurações",
      icon: "fa fa-cog",
    });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MOBILE_BP + 1}px)`);
    const onResize = (e: MediaQueryListEvent) => { if (e.matches) setNavHidden(false); };
    mq.addEventListener("change", onResize);
    return () => mq.removeEventListener("change", onResize);
  }, []);

  return (
    <React.Fragment>
      {!navHidden && <NavBar list={listPathGAPP} />}
      <SettingsPage
        onToggleNav={() => setNavHidden(h => !h)}
        navHidden={navHidden}
      />
    </React.Fragment>
  );
}
