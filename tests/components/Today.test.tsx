import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { Today } from "@components/Today";
import { useSettings } from "@stores/useSettings";

describe("Today screen", () => {
  it("renders Hebrew date and learning bite", async () => {
    useSettings.getState().setLocation({ latitude: 31.778, longitude: 35.235, timezone: "UTC" });
    render(<Today />);
    await waitFor(() => expect(screen.getByText(/Learning Bite/i)).toBeInTheDocument());
    expect(screen.getByText(/בְּרֵאשִׁית/)).toBeInTheDocument();
    expect(screen.getByText(/Candle-lighting/i)).toBeInTheDocument();
  });
});
