import { getGetProfileQueryKey } from "@workspace/api-client-react";
test("probe real import works", () => {
  expect(getGetProfileQueryKey()).toEqual(["/api/profile"]);
});
