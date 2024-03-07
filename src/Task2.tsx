import { useState, type ReactElement, useMemo } from "react";
import { css, isControlUnit } from "../scaffold";
import validateComponentTopology from "./Task1";
import Button from "./Task2/Button";
import Icon from "./Task2/Icon";
import Hint from "./Task2/Hint";
import {
  EMPTY_RESERVOIR,
  SELECT_NULL,
  isControlUnitType,
  isValidType,
} from "./Task2/utils";

import "./Task2.css";

import type {
  ComponentList,
  ControlUnit,
  HydroComponent,
  Hydrobody,
} from "./CodingChallengeTypes";
import Input from "./Task2/Input";
import Select from "./Task2/Select";

interface Task2Props {
  // The input for your component (same format as for task 1)
  initialList: ComponentList;
  // Call this when the user clicks "Save"
  onSubmit: (newList: ComponentList) => void;
}

export default function Task2(props: Task2Props): ReactElement | null {
  const [topology, setTopology] = useState<Array<HydroComponent>>([
    EMPTY_RESERVOIR,
  ]);
  const [touched, setTouched] = useState(false);
  const validation = useMemo(
    () => validateComponentTopology(topology),
    [topology]
  );

  return (
    <form onSubmit={() => props.onSubmit(topology)}>
      <section>
        {topology.map((component, idx) => (
          <fieldset key={idx}>
            <p className="form-element">
              <Input
                label="ID"
                className="input-sm"
                id={`id_${idx}`}
                value={component.id}
                onChange={(e) => {
                  setTouched(true);
                  setTopology((prevTopology) => [
                    ...prevTopology.slice(0, idx),
                    {
                      ...component,
                      id: e.target.value,
                    },
                    ...prevTopology.slice(idx + 1),
                  ]);
                }}
                required
              />
            </p>
            <p className="form-element">
              <Input
                label="Name"
                id={`name_${idx}`}
                value={component.name}
                onChange={(e) => {
                  setTouched(true);
                  setTopology((prevTopology) => [
                    ...prevTopology.slice(0, idx),
                    {
                      ...component,
                      name: e.target.value,
                    },
                    ...prevTopology.slice(idx + 1),
                  ]);
                }}
                required
              />
            </p>
            <p className="with-icon">
              <div className="form-element">
                <Select
                  label="Type"
                  id={`type_${idx}`}
                  value={component.type}
                  onChange={(e) => {
                    setTouched(true);
                    const type = e.target.value;
                    if (!isValidType(type)) {
                      return;
                    }
                    setTopology((prevTopology) => {
                      const newTopology = [...prevTopology];

                      // A bit ugly here, to change HydroComponent Type on the fly :)

                      // If current component is control unit, initialize feedsFrom and spillsTo with null
                      if (isControlUnitType(type)) {
                        newTopology[idx] = {
                          ...component,
                          type,
                          feedsFrom: null,
                          spillsTo: null,
                        } satisfies ControlUnit;
                        return newTopology;
                      }

                      // Otherwise, if current component is hydrobody, remove eventual previous feedsFrom and spillsTo
                      newTopology[idx] = {
                        id: component.id,
                        name: component.name,
                        type,
                      } satisfies Hydrobody;
                      return newTopology;
                    });
                  }}
                >
                  <option value="reservoir">Reservoir</option>
                  <option value="downstream">Downstream</option>
                  <option value="turbine">Turbine</option>
                  <option value="gate">Gate</option>
                </Select>
              </div>
              <Icon type={component.type} />
            </p>
            {isControlUnit(component) && (
              <>
                <p className="form-element">
                  <Select
                    label="Feeds from"
                    id={`feedsFrom_${idx}`}
                    value={component.feedsFrom ?? SELECT_NULL}
                    onChange={(e) => {
                      setTouched(true);
                      const feedsFrom = e.target.value;
                      setTopology((prevTopology) => {
                        const newTopology = [...prevTopology];
                        newTopology[idx] = {
                          ...component,
                          feedsFrom:
                            feedsFrom !== SELECT_NULL ? feedsFrom : null,
                        };
                        return newTopology;
                      });
                    }}
                  >
                    <option value={SELECT_NULL} disabled hidden>
                      Select
                    </option>
                    {component.feedsFrom &&
                      !topology.find(
                        (comp) => comp.id === component.feedsFrom
                      ) && (
                        <option value={component.feedsFrom} hidden disabled>
                          Invalid Id
                        </option>
                      )}
                    {topology
                      .filter((comp, i) => i !== idx)
                      .map((comp, i) => (
                        <option key={i} value={comp.id}>
                          {comp.name || comp.id || comp.type}
                        </option>
                      ))}
                  </Select>
                </p>
                <p className="form-element">
                  <Select
                    label="Spills to"
                    id={`spillsTo_${idx}`}
                    value={component.spillsTo ?? SELECT_NULL}
                    onChange={(e) => {
                      setTouched(true);
                      const spillsTo = e.target.value;
                      setTopology((prevTopology) => {
                        const newTopology = [...prevTopology];
                        newTopology[idx] = {
                          ...component,
                          spillsTo: spillsTo !== SELECT_NULL ? spillsTo : null,
                        };
                        return newTopology;
                      });
                    }}
                  >
                    <option value={SELECT_NULL} disabled hidden>
                      Select
                    </option>
                    {component.spillsTo &&
                      !topology.find(
                        (comp) => comp.id === component.spillsTo
                      ) && (
                        <option value={component.spillsTo} hidden disabled>
                          Invalid Id
                        </option>
                      )}
                    {topology
                      .filter((comp, i) => i !== idx)
                      .map((comp, i) => (
                        <option key={i} value={comp.id}>
                          {comp.name || comp.id || comp.type}
                        </option>
                      ))}
                  </Select>
                </p>
              </>
            )}
            <p className="tools-btn">
              <Button
                onClick={() =>
                  setTopology((prevTopology) => {
                    const newTopology = prevTopology
                      .slice(0, idx)
                      .concat(prevTopology.slice(idx + 1));
                    if (!newTopology.length) {
                      setTouched(false);
                      return [{ ...EMPTY_RESERVOIR }];
                    }
                    setTouched(true);
                    return newTopology;
                  })
                }
              >
                Remove
              </Button>
            </p>
          </fieldset>
        ))}
      </section>
      <section>
        <p className="button-add">
          <Button
            onClick={() => {
              setTouched(true);
              setTopology((prevTopology) => [
                ...prevTopology,
                { ...EMPTY_RESERVOIR },
              ]);
            }}
          >
            Add
          </Button>
        </p>
        <p className="toolbar">
          <Button
            onClick={() => {
              setTouched(false);
              setTopology([{ ...EMPTY_RESERVOIR }]);
            }}
          >
            {/* With enough time, I would add a confirmation modal */}
            Reset
          </Button>
          <Button type="submit" variant="primary" disabled={!validation.valid}>
            Save
          </Button>
        </p>
        {!validation.valid && touched && (
          <p>
            <Hint reason={validation.reason} />
          </p>
        )}
      </section>
    </form>
  );
}
export const styles = css`
  /* Your can add your styles here or in Task2.css */
  .todo {
    font-style: italic;
  }
`;
// =========================

export const description = `
  Task 2:

  Write a React component that:
    * Displays a list of components
    * Allows the user to:
      1. Add a topology component
      2. Edit component properties
      3. Delete a component
      4. Submit the changes (button that calls props.onSubmit)
    * Disable the submit button according to your validation function from task 1

  Style the component to have a working layout - it doesn't need to win a catwalk,
  but shouldn't cause Igor to tell Doctor Frankenstein about it.
`;
