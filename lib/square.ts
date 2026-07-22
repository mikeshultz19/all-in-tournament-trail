export type SquareEnvironment = "sandbox" | "production";

export type SquareConfigurationStatus =
  | { status: "configured"; environment: SquareEnvironment }
  | { status: "unavailable"; reason: "missing_configuration" | "invalid_environment" };

type SquareEnvironmentVariables = {
  [key: string]: string | undefined;
};

export function getSquareConfigurationStatus(
  environment: SquareEnvironmentVariables = process.env,
): SquareConfigurationStatus {
  const squareEnvironment = environment.SQUARE_ENVIRONMENT;
  if (squareEnvironment !== "sandbox" && squareEnvironment !== "production") {
    return { status: "unavailable", reason: "invalid_environment" };
  }

  if (
    !environment.NEXT_PUBLIC_SQUARE_APPLICATION_ID ||
    !environment.NEXT_PUBLIC_SQUARE_LOCATION_ID ||
    !environment.SQUARE_ACCESS_TOKEN
  ) {
    return { status: "unavailable", reason: "missing_configuration" };
  }

  return { status: "configured", environment: squareEnvironment };
}
