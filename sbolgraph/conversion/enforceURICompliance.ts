
import { Predicates } from 'bioterms';
import SXIdentified from '../sbolx/SXIdentified'
import S2Identified from '../sbol2/S2Identified'
import URIUtils from '../URIUtils';
import SBOLXGraphView from 'sbolgraph/SBOLXGraphView';
import SBOL2GraphView from 'sbolgraph/SBOL2GraphView';

export default function enforceURICompliance(g:SBOL2GraphView|SBOLXGraphView, uriPrefix:string) {

    var p_id, p_version, p_persistentIdentity

    if(g instanceof SBOL2GraphView) {
        p_id = Predicates.SBOL2.displayId
        p_version = Predicates.SBOL2.version
        p_persistentIdentity = Predicates.SBOL2.persistentIdentity
    } else {
        p_id = Predicates.SBOLX.id
        p_version = Predicates.SBOLX.version
        p_persistentIdentity = Predicates.SBOLX.persistentIdentity
    }

    for(let topLevel of g.topLevels) {

        let version = topLevel.version

        if(version === undefined) {
            topLevel.version = version = '1'
        }

        addMissingProperties(topLevel, version)
    }

    // Now everything has IDs and versions
    // Second pass: change URIs

    for(let topLevel of g.topLevels) {

        replaceURIs(topLevel, uriPrefix)

    }

    function replaceURIs(object:SXIdentified|S2Identified, prefix:string) {

        let persistentIdentity = prefix + object.getStringProperty(p_id)
        let newURI = persistentIdentity + '/' + object.getStringProperty(p_version)

        object.persistentIdentity = persistentIdentity

        let contained = object.containedObjects

        g.graph.replaceURI(object.uri, newURI)

        for(let child of contained) {
            replaceURIs(child, persistentIdentity + '/')
        }
    }

    function addMissingProperties(object:SXIdentified|S2Identified, version:string) {

        object.version = version

        let id = object.getStringProperty(p_id)

        if(id === undefined) {
            object.setStringProperty(p_id, makeUpID(object))
        }

        for(let child of object.containedObjects) {
            addMissingProperties(child, version)
        }

    }

    function makeUpID(object:SXIdentified|S2Identified):string {

        let name = object.name

        if(name) {

            name = sanitize(name)

            if(name && name !== '') {
                return name
            }
        }

        name = sanitize(URIUtils.getSuffix(object.uri))

        if(name && name !== '') {
            return name
        }

        return (object.facadeType.split('#').pop() || 'anon').toLowerCase()

        function sanitize(s) {
            return s.replace(/[^A-Za-z0-9]/g, '')
        }

    }


}

