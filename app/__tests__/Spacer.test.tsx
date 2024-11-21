import React from "react";
import { render } from "@testing-library/react-native";
import Spacer from "../components/Spacer"; // Adjust the path as needed

describe("Spacer Component", () => {
  it("renders with the correct height", () => {
    const { toJSON } = render(<Spacer height={50} />);
    const spacer = toJSON();

    expect(spacer).toMatchObject({
      type: "View",
      props: {
        style: { height: 50 },
      },
    });
  });

  it("renders with different height when height prop changes", () => {
    const { rerender, toJSON } = render(<Spacer height={30} />);
    let spacer = toJSON();
    expect(spacer).toMatchObject({
      type: "View",
      props: {
        style: { height: 30 },
      },
    });

    rerender(<Spacer height={100} />);
    spacer = toJSON();
    expect(spacer).toMatchObject({
      type: "View",
      props: {
        style: { height: 100 },
      },
    });
  });
});
