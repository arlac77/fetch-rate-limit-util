import test from "ava";
import { waitDecide, MIN_WAIT_MSECS } from "fetch-rate-limit-util";

async function dwdt(
  t,
  millisecondsToWait,
  rateLimitRemaining,
  nthTry,
  expected
) {
  const response = {};
  t.is(
    waitDecide(millisecondsToWait, rateLimitRemaining, nthTry, response),
    expected
  );
}

dwdt.title = (
  providedTitle,
  millisecondsToWait,
  rateLimitRemaining,
  nthTry,
  expected
) =>
  `waitDecide ${millisecondsToWait} ${rateLimitRemaining} ${nthTry}`.trim();

  test(dwdt, 1, 0, 1, 1 + MIN_WAIT_MSECS);
  test(dwdt, 1, 0, 99, -1);
