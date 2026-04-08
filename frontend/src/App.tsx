import { Provider } from "react-redux";
import { MobxApp } from "./mobx/MobxApp";
import { RtkApp } from "./rtk/RtkApp";
import { store } from "./rtk/store";

function App() {
  const stateManager = (import.meta.env.VITE_STATE_MANAGER ?? "mobx").toLowerCase();

  if (stateManager === "rtk" || stateManager === "redux") {
    return (
      <Provider store={store}>
        <RtkApp />
      </Provider>
    );
  }

  return <MobxApp />;
}

export default App;
