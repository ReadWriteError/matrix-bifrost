import * as Chai from "chai";
import { StzaPresenceItem, StzaPresenceError, StzaMessageSubject,
    StzaMessage, StzaPresencePart, StzaPresenceKick, SztaIqError, StzaIqCallInvite } from "../../src/xmppjs/Stanzas";
import { assertXML } from "./util";
const expect = Chai.expect;

describe("Stanzas", () => {
    describe("StzaPresenceItem", () => {
        it("should create a valid stanza", () => {
            const xml = new StzaPresenceItem("foo@bar", "baz@bar", "someid").xml;
            assertXML(xml);
            expect(xml).to.equal(
                "<presence from=\"foo@bar\" to=\"baz@bar\" id=\"someid\">" +
                "<x xmlns='http://jabber.org/protocol/muc#user'>"
                + "<item affiliation='member' role='participant'/></x></presence>",
            );
        });
    });
    describe("StzaPresenceError", () => {
        it("should create a valid stanza", () => {
            const xml = new StzaPresenceError("foo@bar", "baz@bar", "someid", "baz2@bar", "cancel", "inner-error").xml;
            assertXML(xml);
            expect(xml).to.equal(
                "<presence from=\"foo@bar\" to=\"baz@bar\" id=\"someid\" type='error'><x"
                + " xmlns='http://jabber.org/protocol/muc'/><error type='cancel' by='baz2@bar'>"
                + "<inner-error xmlns='urn:ietf:params:xml:ns:xmpp-stanzas'/></error></presence>",
            );
        });
    });
    describe("StzaPresencePart", () => {
        it("should create a valid stanza", () => {
            const xml = new StzaPresencePart("foo@bar", "baz@bar").xml;
            assertXML(xml);
            expect(xml).to.equal(
                "<presence from=\"foo@bar\" to=\"baz@bar\" type='unavailable'></presence>",
            );
        });
    });
    describe("StzaPresenceKick", () => {
        it("should create a valid stanza", () => {
            const xml = new StzaPresenceKick("foo@bar", "baz@bar", "reasonable reason", "Kicky", true).xml;
            assertXML(xml);
            expect(xml).to.equal(
                `<presence from="foo@bar" to="baz@bar" type='unavailable'>`
                + "<x xmlns='http://jabber.org/protocol/muc#user'><status code='110'/>"
                + "<status code='307'/><item affiliation='none' role='none'>"
                + "<actor nick='Kicky'/><reason>reasonable reason</reason></item></x></presence>",
            );
        });
    });
    describe("StzaMessage", () => {
        it("should create a valid stanza for a simple plain message", () => {
            const stanza = new StzaMessage("foo@bar", "baz@bar", "someid", "groupchat");
            stanza.body = "Viva la matrix̭";
            assertXML(stanza.xml);
            expect(stanza.xml).to.equal(
                "<message from=\"foo@bar\" to=\"baz@bar\" id=\"someid\" type='groupchat'>"
                + "<body>Viva la matrix&#813;</body><markable xmlns='urn:xmpp:chat-markers:0'/></message>",
            );
        });
        it("should create a valid stanza for a html message", () => {
            const stanza = new StzaMessage("foo@bar", "baz@bar", "someid", "groupchat");
            stanza.body = "Viva la matrix̭";
            stanza.html = "<html><p><strong>Viva la</strong> matrix&#813;</p></html>";
            assertXML(stanza.xml);
            expect(stanza.xml).to.equal(
                "<message from=\"foo@bar\" to=\"baz@bar\" id=\"someid\" type='groupchat'><html><p>"
                + "<strong>Viva la</strong> matrix&#813;</p></html><body>Viva la matrix&#813;</body>"
                + "<markable xmlns='urn:xmpp:chat-markers:0'/></message>",
            );
        });
        it("should create a valid stanza for a message with attachments", () => {
            const stanza = new StzaMessage("foo@bar", "baz@bar", "someid", "groupchat");
            stanza.body = "Viva la matrix̭";
            stanza.html = "<html><p><strong>Viva la</strong> matrix&#x32D;</p></html>";
            stanza.attachments = ["http://matrix.org"];
            assertXML(stanza.xml);
            expect(stanza.xml).to.equal(
                "<message from=\"foo@bar\" to=\"baz@bar\" id=\"someid\" type='groupchat'><html><p>"
                + "<strong>Viva la</strong> matrix&#x32D;</p></html><body>http://matrix.org</body>"
                + "<x xmlns='jabber:x:oob'><url>http://matrix.org</url></x>"
                + "<markable xmlns='urn:xmpp:chat-markers:0'/></message>",
            );
        });
    });
    describe("StzaMessageSubject", () => {
        it("should create a valid stanza", () => {
            const xml = new StzaMessageSubject("foo@bar", "baz@bar", "someid", "This is a subject").xml;
            assertXML(xml);
            expect(xml).to.equal(
                "<message from=\"foo@bar\" to=\"baz@bar\" id=\"someid\" type='groupchat'>"
                + "<subject>This is a subject</subject></message>",
            );
        });
    });
    describe("SztaIqError", () => {
        it("should create a an error", () => {
            const xml = new SztaIqError("foo@bar", "baz@bar", "someid", "cancel", null, "not-acceptable", "foo").xml;
            assertXML(xml);
            expect(xml).to.equal(
                "<iq from='foo@bar' to='baz@bar' id='someid' type='error' xml:lang='en'>" +
                 "<error type='cancel' by='foo'><not-acceptable xmlns='urn:ietf:params:xml:ns:xmpp-stanzas'/>" +
                 "</error></iq>",
            );
        });
    });
    it("should create a an error with custom text", () => {
        const xml = new SztaIqError("foo@bar", "baz@bar", "someid", "cancel", null, "not-acceptable", "foo", "Something isn't right").xml;
        assertXML(xml);
        expect(xml).to.equal(
            "<iq from='foo@bar' to='baz@bar' id='someid' type='error' xml:lang='en'>" +
             "<error type='cancel' by='foo'><not-acceptable xmlns='urn:ietf:params:xml:ns:xmpp-stanzas'/>" +
             `<text xmlns="urn:ietf:params:xml:ns:xmpp-stanzas">Something isn&apos;t right</text>` +
             "</error></iq>",
        );
    });
    describe("StzaIqCallInvite", () => {
        it("should create a valid stanza for a call invitation/initiation", () => {
            const stanza = new StzaIqCallInvite("foo@bar", "baz@bar", "somesessionid",
                "v=0\r\n"
                + "o=- 4658418796541697654 2 IN IP4 127.0.0.1\r\n"
                + "s=-\r\n"
                + "t=0 0\r\n"
                + "a=group:BUNDLE 0\r\n"
                + "a=extmap-allow-mixed\r\n"
                + "a=msid-semantic: WMS 00ae2839-cc99-4b32-b806-2544373c5fe1\r\n"
                + "m=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 110 112 113 126\r\n"
                + "c=IN IP4 0.0.0.0\r\n"
                + "a=rtcp:9 IN IP4 0.0.0.0\r\n"
                + "a=ice-ufrag:8hhY\r\n"
                + "a=ice-pwd:Cahlo5kuluK9Umo1iePhie8u\r\n"
                + "a=ice-options:trickle\r\n"
                + "a=fingerprint:sha-256 FA:82:47:6A:55:FD:62:59:51:A8:57:00:92:9B:8A:CD:81:78:38:2D:3F:BA:C1:BC:9D:A8:F0:0A:D4:5B:55:9B\r\n"
                + "a=setup:actpass\r\n"
                + "a=mid:0\r\n"
                + "a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\n"
                + "a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\n"
                + "a=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\n"
                + "a=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\n"
                + "a=extmap:5 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\n"
                + "a=extmap:6 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\n"
                + "a=sendrecv\r\n"
                + "a=msid:00ae2839-cc99-4b32-b806-2544373c5fe1 569f13a2-6e94-442d-bbf9-bec177edbe1b\r\n"
                + "a=rtcp-mux\r\n"
                + "a=rtpmap:111 opus/48000/2\r\n"
                + "a=rtcp-fb:111 transport-cc\r\n"
                + "a=fmtp:111 minptime=10;useinbandfec=1\r\n"
                + "a=rtpmap:103 ISAC/16000\r\n"
                + "a=rtpmap:104 ISAC/32000\r\n"
                + "a=rtpmap:9 G722/8000\r\n"
                + "a=rtpmap:0 PCMU/8000\r\n"
                + "a=rtpmap:8 PCMA/8000\r\n"
                + "a=rtpmap:106 CN/32000\r\n"
                + "a=rtpmap:105 CN/16000\r\n"
                + "a=rtpmap:13 CN/8000\r\n"
                + "a=rtpmap:110 telephone-event/48000\r\n"
                + "a=rtpmap:112 telephone-event/32000\r\n"
                + "a=rtpmap:113 telephone-event/16000\r\n"
                + "a=rtpmap:126 telephone-event/8000\r\n"
                + "a=ssrc:3904081438 cname:9L+yOhOTfYBk4bhY\r\n"
                + "a=ssrc:3904081438 msid:00ae2839-cc99-4b32-b806-2544373c5fe1 569f13a2-6e94-442d-bbf9-bec177edbe1b\r\n"
                + "a=ssrc:3904081438 mslabel:00ae2839-cc99-4b32-b806-2544373c5fe1\r\n"
                + "a=ssrc:3904081438 label:569f13a2-6e94-442d-bbf9-bec177edbe1b\r\n",
                "someid");
            assertXML(stanza.xml);
            expect(stanza.xml).to.equal(
                '<iq xmlns="jabber:client" id="someid" to="baz@bar" from="foo@bar" type="set">'
                + '<jingle xmlns="urn:xmpp:jingle:1" action="session-initiate" initiator="foo@bar" sid="somesessionid">'
                + '<content creator="initiator" name="0">'
                + '<description xmlns="urn:xmpp:jingle:apps:rtp:1" xmlns:rtcpf="urn:xmpp:jingle:apps:rtp:rtcp-fb:0" xmlns:rtph="urn:xmpp:jingle:apps:rtp:rtp-hdrext:0" media="audio" ssrc="3904081438">'
                + '<rtcp-mux/>'
                + '<payload-type channels="2" clockrate="48000" id="111" name="opus">'
                + '<parameter name="minptime" value="10"/>'
                + '<parameter name="useinbandfec" value="1"/>'
                + '<rtcpf:rtcp-fb type="transport-cc"/>'
                + '</payload-type>'
                + '<payload-type channels="1" clockrate="16000" id="103" name="ISAC"/>'
                + '<payload-type channels="1" clockrate="32000" id="104" name="ISAC"/>'
                + '<payload-type channels="1" clockrate="8000" id="9" name="G722"/>'
                + '<payload-type channels="1" clockrate="8000" id="0" name="PCMU"/>'
                + '<payload-type channels="1" clockrate="8000" id="8" name="PCMA"/>'
                + '<payload-type channels="1" clockrate="32000" id="106" name="CN"/>'
                + '<payload-type channels="1" clockrate="16000" id="105" name="CN"/>'
                + '<payload-type channels="1" clockrate="8000" id="13" name="CN"/>'
                + '<payload-type channels="1" clockrate="48000" id="110" name="telephone-event"/>'
                + '<payload-type channels="1" clockrate="32000" id="112" name="telephone-event"/>'
                + '<payload-type channels="1" clockrate="16000" id="113" name="telephone-event"/>'
                + '<payload-type channels="1" clockrate="8000" id="126" name="telephone-event"/>'
                + '<rtph:rtp-hdrext id="1" uri="urn:ietf:params:rtp-hdrext:ssrc-audio-level"/>'
                + '<rtph:rtp-hdrext id="2" uri="http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time"/>'
                + '<rtph:rtp-hdrext id="3" uri="http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01"/>'
                + '<rtph:rtp-hdrext id="4" uri="urn:ietf:params:rtp-hdrext:sdes:mid"/>'
                + '<rtph:rtp-hdrext id="5" uri="urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id"/>'
                + '<rtph:rtp-hdrext id="6" uri="urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id"/>'
                + '<source xmlns="urn:xmpp:jingle:apps:rtp:ssma:0" ssrc="3904081438">'
                + '<parameter name="cname" value="9L+yOhOTfYBk4bhY"/>'
                + '</source>'
                + '<stream xmlns="urn:xmpp:jingle:apps:rtp:msid:0" id="00ae2839-cc99-4b32-b806-2544373c5fe1" track="569f13a2-6e94-442d-bbf9-bec177edbe1b"/>'
                + '</description>'
                + '<transport xmlns="urn:xmpp:jingle:transports:ice-udp:1" ufrag="8hhY" pwd="Cahlo5kuluK9Umo1iePhie8u">'
                + '<fingerprint xmlns="urn:xmpp:jingle:apps:dtls:0" hash="sha-256" setup="actpass">FA:82:47:6A:55:FD:62:59:51:A8:57:00:92:9B:8A:CD:81:78:38:2D:3F:BA:C1:BC:9D:A8:F0:0A:D4:5B:55:9B</fingerprint>'
                + '</transport>'
                + '</content>'
                + '<group xmlns="urn:xmpp:jingle:apps:grouping:0" semantics="BUNDLE">'
                + '<content name="0"/>'
                + '</group>'
                + '</jingle>'
                + '</iq>'
            );
        });
    });
});
