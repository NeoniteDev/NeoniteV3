import { create as builder } from 'xmlbuilder2';
import { Node } from 'xml-parser';


export const objects = Object.freeze({
   open: {
      open: {
         '@xmlns': 'urn:ietf:params:xml:ns:xmpp-framing',
         '@from': 'neonite.dev'
      }
   },
   'stream:features-session': {
      'stream:features': {
         '@xmlns:stream': 'http://etherx.jabber.org/streams',
         session: { '@xmlns': 'urn:ietf:params:xml:ns:xmpp-session' },
         bind: { '@xmlns': 'urn:ietf:params:xml:ns:xmpp-bind' }
      }
   },
   'stream:features': {
      'stream:features': {
         '@xmlns:stream': 'http://etherx.jabber.org/streams',
         mechanisms: {
            '@xmlns': 'urn:ietf:params:xml:ns:xmpp-sasl',
            mechanism: 'PLAIN'
         }
      }
   },
   'iq-response': {
      iq: {
         '@type': 'result',
         '@from': 'Neonite.dev',
         '@xmlns': 'jabber:client'
      }
   },
   'auth-succes': {
      success: { '@xmlns': 'urn:ietf:params:xml:ns:xmpp-sasl' }
   },
   'auth-failure': {
      failure: {
         '@xmlns': 'urn:ietf:params:xml:ns:xmpp-sasl',
         'not-authorized': {}
      }
   },
   'system-shutdown': {
      'stream:error': {
         'system-shutdown': { '@xmlns': 'urn:ietf:params:xml:ns:xmpp-streams' }
      }
   }
})

export const buildFunctions = Object.freeze({
   notBinded(msg: string, xml: Node) {
      const build = builder(msg).root()

      build.att('type', 'error');

      if (!xml.attributes.xmlns) {
         build.att('xmlns', 'jabber:client');
      }

      build.ele(
         error(
            401,
            'auth',
            'not-authorized',
            'You must bind the resource first: http://www.xmpp.org/rfcs/rfc3920.html#bind'
         )
      )

      return build;
   },
   serviceUnavailable(msg: string, xml: Node) {
      const build = builder(msg).root();

      build.att('type', 'error');

      if (!xml.attributes.xmlns) {
         build.att('xmlns', 'jabber:client');
      }

      build.ele(
         error(
            503,
            'cancel',
            'service-unavailable',
            'Service not available.'
         )
      );

      return build;
   },
   sessionNotAuthorized(msg: string, xml: Node, message = 'Session is not yet authorized.') {
      const build = builder(msg).root();

      build.att('type', 'error');

      if (!xml.attributes.xmlns) {
         build.att('xmlns', 'jabber:client');
      }

      build.ele(
         error(
            401,
            'auth',
            'not-authorized',
            message
         )
      );

      return build;
   },
   tigaseError(msg: string, xml: Node) {
      const build = builder(msg).root();
      build.att('id', 'tigase-error-tigase')
      build.removeAtt('to');
      build.att('from', xml.attributes.to || 'null');
      build.att('version', '1.0');
      build.att('xml:lang', 'en');
      build.ele({
         'stream:error': {
            '@xmlns:stream': 'http://etherx.jabber.org/streams',
            'host-unknown': { '@xmlns': 'urn:ietf:params:xml:ns:xmpp-streams' }
         }
      });

      return build;
   },
   featureNotImplemented(msg: string, xml: Node) {
      const build = builder(msg).root();
      build.att('type', 'error');

      if (!xml.attributes.xmlns) {
         build.att('xmlns', 'jabber:client');
      }

      build.ele(
         error(
            501,
            'cancel',
            'feature-not-implemented',
            'Feature not supported yet.'
         )
      );

      return build;
   },
   buildError(msg: string, xml: Node) {
      const build = builder(msg).root();
      build.removeAtt('from');
      build.removeAtt('to');
      build.att('from', xml.attributes.to || 'Neonite.dev');
      build.att('to', xml.attributes.from || 'null');

      return build;
   }
})

export const rawXML = Object.freeze({
   'system-shutdown':
      '<stream:error>\n' +
      '\t<system-shutdown\n' +
      "\t\txmlns='urn:ietf:params:xml:ns:xmpp-streams'/>\n" +
      '</stream:error>',
   'internal-server-error': '<stream:error>\n' +
      '    <internal-server-error\n' +
      "        xmlns='urn:ietf:params:xml:ns:xmpp-streams'/>\n" +
      '</stream:error>',

   close: "<close xmlns='urn:ietf:params:xml:ns:xmpp-framing' from='Neonite.dev'/>"
})

export const namespaces = Object.freeze({
   'xmpp-framing': 'urn:ietf:params:xml:ns:xmpp-framing',
   'xmpp-sasl': 'urn:ietf:params:xml:ns:xmpp-sasl',
   'xmpp-bind': 'urn:ietf:params:xml:xmpp-bind',
   'xmpp-session': 'urn:ietf:params:xml:xmpp-session',
   'xmpp-stream': 'urn:ietf:params:xml:ns:xmpp-streams',
   'stream': 'http://etherx.jabber.org/streams',
   'delay': 'urn:xmpp:delay',
   'client': 'jabber:client',
   'iq-auth': 'http://jabber.org/features/iq-auth',
})

import { readFileSync } from 'fs';
import * as xmlLint from 'xmllint';
import * as path from 'path';

const schemas_dir = path.join(__dirname, 'schemas');

const schemas = {
   SASL: readFileSync(path.join(schemas_dir, 'auth.xsd'), 'utf-8'),
   client: [
      readFileSync(path.join(schemas_dir, 'client.xsd'), 'utf-8'),
      readFileSync(path.join(schemas_dir, 'client_nons.xsd'), 'utf-8')
   ],
   binding: readFileSync(path.join(schemas_dir, 'bind.xsd'), 'utf-8')
}


export function validate(xml: string, type: keyof typeof schemas) {
   return xmlLint.validateXML({
      xml,
      schema: schemas[type]
   })
}


function error(status: number, type: string, elename: string, text: string) {
   return {
      error: {
         '@code': status.toString(),
         '@type': type,
         [elename]: { '@xmlns': 'urn:ietf:params:xml:ns:xmpp-stanzas' },
         text: {
            '@xmlns': 'urn:ietf:params:xml:ns:xmpp-stanzas',
            '@xml:lang': 'en',
            '#': text
         }
      }
   }
}