import { gmail_v1 as gmailv1 } from 'googleapis';
import addressParse from 'emailjs-addressparser';

type MessageText = {
  type: 'text' | 'html';
  text: string;
};

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

const findHeaderValue = (
  name: string,
  headers?: gmailv1.Schema$MessagePartHeader[]
) => {
  if (headers === undefined) {
    return '';
  }
  const filteredHeaders = headers.filter((x) => x.name === name);
  if (filteredHeaders.length === 0) {
    return '';
  }
  const { value } = filteredHeaders[0];
  if (value === undefined || value === null) {
    return '';
  }
  return value;
};

const diaplayName = (from: string): string => {
  const [{ name, address }] = addressParse(from);
  return name === '' ? address : name;
};

const parseToMessageHeading = (message: gmailv1.Schema$Message) => {
  const id = message.id || '';
  const fromHeader = findHeaderValue('From', message.payload?.headers);
  const subject = findHeaderValue('Subject', message.payload?.headers);
  const snippet = message?.snippet || '';
  const from = diaplayName(fromHeader);
  const unread = message.labelIds?.find((x) => x === 'UNREAD') !== undefined;
  return { id, from, subject, snippet, unread };
};

const parseTextPlain = (
  payload?: gmailv1.Schema$MessagePart
): MessageText | undefined => {
  const bodyData = payload?.body?.data;
  if (bodyData === undefined || bodyData === null) {
    return undefined;
  }
  const text = Buffer.from(bodyData, 'base64').toString();
  return { type: 'text', text };
};

const parseTextHtml = (
  payload?: gmailv1.Schema$MessagePart
): MessageText | undefined => {
  const bodyData = payload?.body?.data;
  if (bodyData === undefined || bodyData === null) {
    return undefined;
  }
  const text = Buffer.from(bodyData, 'base64').toString();
  return { type: 'html', text };
};

const findPartByMimeType = (
  mimeType: string,
  parts?: gmailv1.Schema$MessagePart[]
): gmailv1.Schema$MessagePart | undefined =>
  parts?.find((x) => x.mimeType === mimeType);

const parseMultipart = (
  payload?: gmailv1.Schema$MessagePart
): MessageText | undefined => {
  if (payload === undefined) {
    return undefined;
  }
  const { parts } = payload;
  const partAlternative = findPartByMimeType('multipart/alternative', parts);
  if (partAlternative !== undefined) {
    return parseMultipart(partAlternative);
  }
  const partRelated = findPartByMimeType('multipart/related', parts);
  if (partRelated !== undefined) {
    return parseMultipart(partRelated);
  }
  const partHtml = findPartByMimeType('text/html', parts);
  if (partHtml !== undefined) {
    return parseTextHtml(partHtml);
  }
  const partPlain = findPartByMimeType('text/plain', parts);
  return parseTextPlain(partPlain);
};

const parsePayload = (payload?: gmailv1.Schema$MessagePart) => {
  switch (payload?.mimeType) {
    case 'text/plain':
      return parseTextPlain(payload);
    case 'text/html':
      return parseTextHtml(payload);
    case 'multipart/alternative':
    case 'multipart/mixed':
    case 'multipart/signed':
    case 'multipart/related':
      return parseMultipart(payload);
    default:
      return undefined;
  }
};

const parseToMessage = (
  message: gmailv1.Schema$Message
): {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  unread: boolean;
  body: {
    type: 'html' | 'text';
    text: string;
  };
} => {
  const messageHeading = parseToMessageHeading(message);
  const messageText = parsePayload(message.payload) || {
    type: 'text',
    text: 'no message',
  };
  const type = messageText.type === 'html' ? 'html' : 'text';
  const { text } = messageText;
  return { ...messageHeading, body: { type, text } };
};

export default {
  fetchJson,
  parseToMessage,
};
