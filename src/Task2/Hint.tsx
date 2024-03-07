import { Task1Result } from "../CodingChallengeTypes";
import styles from "./Hint.module.css";

function reasonToReadable(reason: string) {
  switch (reason) {
    case "no-downstream":
      return `In every topology, there must exist at least one downstream (type="downstream").
This is where water ends up spilling to at the end of a topology.`;
    case "unit-not-connected":
      return `Every control unit (type="turbine" or type="gate") must take water from a component (feedsFrom)
and spill its water into a component (spillsTo).`;
    case "feeding-from-downstream":
      return `A control unit (type="turbine" or "gate") may spill to a downstream (spillsTo === downstream.id),
but control units may not take water from downstream (feedsFrom === downstream.id).`;
    case "reservoir-not-connected":
      return `Every reservoir (type="reservoir") needs to be spill into a control unit (type="turbine" or "gate").
Does not apply to type="downstream" hydrobodies.
It is okay for a reservoir to spill into multiple control units, and for multiple control units
to spill into the same reservoir.`;
    case "invalid-id":
      return `The components a control unit connects to (feedsFrom, spillsTo) must be the id of another component.`;
    case "unit-connected-to-unit":
      return `A turbine or gate can not connect to another turbine or a gate.`;
    case "closed-loop":
      return `It is not allowed for a component to spill into a reservoir "above" it (e.g. A -> B -> C -> D -> A)`;
  }
  return reason;
}
export default function Hint({ reason }: { reason: string }) {
  return <span className={styles.hint}>{reasonToReadable(reason)}</span>;
}
