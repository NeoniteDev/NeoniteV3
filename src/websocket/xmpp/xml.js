const { create: builder } = require('xmlbuilder2')
const xmlparser = require('xml-parser')

module.exports.objects = {
   open: {
      open: {
         '@id': 'PLACEHOLDER',
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
   'not_binded': function (xml_string) {
      const build = builder(xml_string).root()
      const xml = xmlparser(xml_string).root;

      build.att('type', 'error');

      if (!xml.attributes.xmlns) {
         build.att('xmlns', 'jabber:client');
      }

      build.ele(
         ErrorObject(
            401,
            'auth',
            'not-authorized',
            'You must bind the resource first: http://www.xmpp.org/rfcs/rfc3920.html#bind'
         )
      )

      return build.toObject();
   },
   'service_unavailable': function (xml_string) {
      const build = builder(xml_string).root();
      const xml = xmlparser(xml_string).root;

      build.att('type', 'error');

      if (!xml.attributes.xmlns) {
         build2.att('xmlns', 'jabber:client');
      }

      build.ele(
         ErrorObject(
            503,
            'cancel',
            'service-unavailable',
            'Service not available.'
         )
      );

      return build.toObject();
   },
   'system-shutdown': {
      'stream:error': {
         'system-shutdown': { '@xmlns': 'urn:ietf:params:xml:ns:xmpp-streams' }
      }
   },
   'feature_not_implemented': function (xml_string) {
      const build = builder(xml_string).root();
      const xml = xmlparser(xml_string).root;

      build.att('type', 'error');

      if (!xml.attributes.xmlns) {
         build.att('xmlns', 'jabber:client');
      }

      build.ele(
         ErrorObject(
            501,
            'cancel',
            'feature-not-implemented',
            'Feature not supported yet.'
         )
      );

      return build.toObject();
   },
   /** @returns {{"error":{"@code":"5","@type":"type","sus":{"@xmlns":"urn:ietf:params:xml:ns:xmpp-stanzas"},"text":{"@xmlns":"urn:ietf:params:xml:ns:xmpp-stanzas","@xml:lang":"en","#":"text"}}}} */
   'session_not_authorized': function (xml_string) {
      const build = builder(xml_string).root();
      const xml = xmlparser(xml_string).root;

      build.att('type', 'error');

      if (!xml.attributes.xmlns) {
         build.att('xmlns', 'jabber:client');
      }

      build.ele(
         ErrorObject(
            401,
            'auth',
            'not-authorized',
            'Session is not yet authorized.'
         )
      );

      return build.toObject();
   },
   build_tigase_error(msg, xml) {
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
   }
}
module.exports.string = {
   'system-shutdown':
      '<stream:error>\n' +
      '\t<system-shutdown\n' +
      "\t\txmlns='urn:ietf:params:xml:ns:xmpp-streams'/>\n" +
      '</stream:error>',
   'close': "<close xmlns='urn:ietf:params:xml:ns:xmpp-framing' from='Neonite.dev'/>"
}

module.exports.namespaces = {
   'xmpp-framing': 'urn:ietf:params:xml:ns:xmpp-framing',
   'xmpp-sasl': 'urn:ietf:params:xml:ns:xmpp-sasl',
   'xmpp-bind': 'urn:ietf:params:xml:xmpp-bind',
   'xmpp-session': 'urn:ietf:params:xml:xmpp-session',
   'xmpp-stream': 'urn:ietf:params:xml:ns:xmpp-streams',
   'stream': 'http://etherx.jabber.org/streams',
   'delay': 'urn:xmpp:delay',
   'client': 'jabber:client',
   'iq-auth': 'http://jabber.org/features/iq-auth',
}

module.exports.build_server_error = function (xml_string) {
   const xml = xmlparser(xml_string).root;
   const build = builder(msg).root();
   build.removeAtt('from');
   build.removeAtt('to');
   build.att('from', xml.attributes.to || 'Neonite.dev');
   build.att('to', xml.attributes.from || 'null');

   return build;
}

const { readFileSync } = require('fs');
const xmlLint = require('xmllint');
const path = require('path');

const schemas_dir = path.join(__dirname, 'schemas');

const schemas = {
   SASL: readFileSync(path.join(schemas_dir, 'auth.xsd'), 'utf-8'),
   client: [
      readFileSync(path.join(schemas_dir, 'client.xsd'), 'utf-8'),
      readFileSync(path.join(schemas_dir, 'client_nons.xsd'), 'utf-8')
   ],
   binding: readFileSync(path.join(schemas_dir, 'bind.xsd'), 'utf-8')
}

/**
 * 
 * @param {String} xml 
 * @param {keyof schemas} type
 */
module.exports.validate = (xml, type) => {
   return xmlLint.validateXML({
      xml,
      schema: schemas[type]
   })
}

/**
 * 
 * @param {Number} status 
 * @param {String} type 
 * @param {String} elename 
 * @param {String} text 
 */
function ErrorObject(status, type, elename, text) {
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