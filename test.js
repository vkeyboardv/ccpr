const { parse } = require('./index.js');
const { assert } = require('chai');

const expectedStr =
  'https://us-east-1.console.aws.amazon.com/codesuite/codecommit/repositories/my-repo/pull-requests/new/refs/heads/master/.../refs/heads/feature/dev-02-test-2?region=us-east-1';

describe('ccpr', () => {
  describe('parse()', () => {
    it('1: push', () => {
      const str = `To ssh://git-codecommit.us-east-1.amazonaws.com/v1/repos/my-repo
  54c5262..d6685a1  feature/dev-02-test-2 -> feature/dev-02-test-2`;

      const res = parse(str);
      assert.deepStrictEqual(res, expectedStr);
    });

    it('2: force push', () => {
      const str =
        'To ssh://git-codecommit.us-east-1.amazonaws.com/v1/repos/my-repo\n' +
        ' + c4b6d6e...7a7c371 feature/dev-02-test-2 -> feature/dev-02-test-2 (forced update)\n';

      const res = parse(str);
      assert.deepStrictEqual(res, expectedStr);
    });
  });
});
