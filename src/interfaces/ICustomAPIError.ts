import {CustomAPIError} from '../errors';

export interface ICustomAPIErrorWithStatusCode extends CustomAPIError {
  statusCode: number;
}

export default ICustomAPIErrorWithStatusCode;
