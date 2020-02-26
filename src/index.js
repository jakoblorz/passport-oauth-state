// @flow
import util from 'util';
import * as crypto from 'crypto';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function uniqueId(length: number) {
  const bytes = crypto.pseudoRandomBytes(length);

  let r = [];
  for (let i = 0; i < bytes.length; i++) {
    r.push(CHARS[bytes[i] % CHARS.length]);
  }

  return r.join('');
}

function Store(
  addState: (req: any, state: string) => void | Promise<void>,
  removeState: (req: any, state: string) => void | Promise<void>,
  verifyState: (req: any, providedState: string) => boolean | Promise<boolean>
) {
  this.addState = addState;
  this.removeState = removeState;
  this.verifyState = verifyState;
}

Store.prototype.store = async function(req: any, callback: Function) {
  const state = uniqueId(24);

  try {
    await this.addState(req, state);
  } catch (e) {
    return callback(e);
  }

  callback(null, state);
};

Store.prototype.verify = async function(
  req: any,
  providedState: string,
  callback: Function
) {
  let err: ?Error;
  let isMatching = false;
  try {
    isMatching = await this.verifyState(req, providedState);
    await this.removeState(req, providedState);
  } catch (e) {
    err = e;
  }
  if (err || !isMatching) {
    return callback(err, false, {
      message: 'Unable to verify authorization request state.',
    });
  }

  callback(null, true);
};

util.inherits(Store, Function);

export default Store;
