type Ok<Value, _> = {
  type: "ok";
  value: Value;
};

type Err<_, Error> = {
  type: "err";
  error: Error;
};

export type Result<Value, Error> = Ok<Value, Error> | Err<Value, Error>;

export const ok = <Value, Error>(value: Value): Result<Value, Error> => ({
  type: "ok",
  value,
});

export type OkFunction = typeof ok;

export const err = <Value, Error>(error: Error): Result<Value, Error> => ({
  type: "err",
  error,
});

export type ErrFunction = typeof err;

export type ResultFunctions = {
  ok: OkFunction;
  err: ErrFunction;
};
