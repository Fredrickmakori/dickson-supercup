import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders landing page title", () => {
  render(<App />);
  const title = screen.getByText(/Transforming Keiyo Ward into a vibrant/i);
  expect(title).toBeInTheDocument();
});
