export const fetchJson = async <T>(
  accessToken: string,
  input: RequestInfo
): Promise<
  { ok: false; status: number } | { ok: true; status: number; json: T }
> => {
  const init = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  const response = await fetch(
    `https://www.googleapis.com/gmail/v1${input}`,
    init
  );
  const { ok, status } = response;
  if (ok === false) {
    return { ok, status };
  }
  const json = await response.json();
  return { ok, status, json };
};

export default {
  fetchJson,
};
