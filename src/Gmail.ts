const fetchJson0 = async <T>(
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

const fetchJson = async <T>(
  accessToken: string,
  input: RequestInfo,
  reauthenticate: () => Promise<string>
) => {
  const result = await fetchJson0<T>(accessToken, input);
  if (result.status === 401) {
    const reAccessToken = await reauthenticate();
    return fetchJson0<T>(reAccessToken, input);
  }
  return result;
};

export default {
  fetchJson,
};
