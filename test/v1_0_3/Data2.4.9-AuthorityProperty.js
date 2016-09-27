/**
 * Description : This is a test suite that tests an LRS endpoint based on the testing requirements document
 * found at https://github.com/adlnet/xAPI_LRS_Test/blob/master/TestingRequirements.md
 *
 * https://github.com/adlnet/xAPI_LRS_Test/blob/master/TestingRequirements.md
 *
 */

(function (module, fs, extend, moment, request, requestPromise, chai, liburl, Joi, helper, multipartParser, redirect, templatingSelection) {
    // "use strict";

    var expect = chai.expect;
    if(global.OAUTH)
        request = helper.OAuthRequest(request);

describe('Authority Property Requirements (Data 2.4.9)', () => {

    templatingSelection.createTemplate('authorities.js');

    it('An LRS rejects with error code 400 Bad Request, a Request whose "authority" is a Group and consists of non-O-Auth Agents (Data 2.4.9.s3.b3)', function (done) {
        var templates = [
            {statement: '{{statements.default}}'},
            {authority: {"objectType": "Group", "name": "xAPI Group", "mbox": "mailto:xapigroup@example.com",
            "member":[{"name":"agentA","mbox":"mailto:agentA@example.com"},{"name":"agentB","mbox":"mailto:agentB@example.com"}]}}
        ];
        var data = helper.createFromTemplate(templates);
        data = data.statement;
        request(helper.getEndpointAndAuth())
            .post(helper.getEndpointStatements())
            .headers(helper.addAllHeaders({}))
            .json(data)
            .expect(400, done)
    });

    describe('An LRS populates the "authority" property if it is not provided in the Statement, based on header information with the Agent corresponding to the user (contained within the header) (Implicit, Data 2.4.9.s3.b4) ', function () {

        it('should populate authority ', function (done) {

            this.timeout(0);
            var templates = [
                {statement: '{{statements.default}}'}
            ];
            var data = helper.createFromTemplate(templates);
            data = data.statement;
            data.id = helper.generateUUID();
            var query = '?statementId=' + data.id;
            var stmtTime = Date.now();

            request(helper.getEndpointAndAuth())
            .post(helper.getEndpointStatements())
            .headers(helper.addAllHeaders({}))
            .json(data)
            .expect(200)
            .end()
            .get(helper.getEndpointStatements() + '?statementId=' + data.id)
            .headers(helper.addAllHeaders({}))
            .wait(helper.genDelay(stmtTime, query, data.id))
            .expect(200).end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    var statement = helper.parse(res.body, done);
                    expect(statement).to.have.property('authority');
                    done();
                }
            });
        });
    });

});

}(module, require('fs'), require('extend'), require('moment'), require('super-request'), require('supertest-as-promised'), require('chai'), require('url'), require('joi'), require('./../helper'), require('./../multipartParser'), require('./../redirect.js'), require('./../templatingSelection.js')));
