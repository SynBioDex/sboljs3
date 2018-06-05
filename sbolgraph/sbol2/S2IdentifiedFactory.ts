
import S2Identified from "./S2Identified";
import { Predicates } from 'bioterms'
import * as node from '../node'
import CompliantURIs from '../SBOL2CompliantURIs'
import SBOL2Graph from '../SBOL2Graph'

export default class SXIdentifiedFactory {
    
    static createTopLevel(graph:SBOL2Graph,
                          type:string,
                          uriPrefix:string,
                          id:string,
                          name:string|undefined,
                          version?:string|undefined):S2Identified {

        id = nameToID(id)

        if(version === undefined)
            version = '1'

        const uri:string = graph.generateURI(uriPrefix + id + '$n?$/' + version)

        graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOL2.displayId]: node.createStringNode(CompliantURIs.getDisplayId(uri)),
            [Predicates.SBOL2.persistentIdentity]: node.createUriNode(CompliantURIs.getPersistentIdentity(uri)),
            [Predicates.SBOL2.version]: node.createStringNode(CompliantURIs.getVersion(uri))
        })

        if(name !== undefined) {
            graph.insertProperties(uri, {
                [Predicates.Dcterms.title]: node.createStringNode(name)
            })
        }

        return new S2Identified(graph, uri)

    }

    static createChild(graph:SBOL2Graph,
                    type:string,
                    parent:S2Identified,
                    id:string,
                    name:string|undefined,
                    version?:string|undefined):S2Identified {

        id = nameToID(id)

        if(version === undefined)
            version = '1'

        const uri:string = graph.generateURI(
            parent.persistentIdentity + '/' + id + '$n?$/' + version)

        graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOL2.displayId]: node.createStringNode(CompliantURIs.getDisplayId(uri)),
            [Predicates.SBOL2.persistentIdentity]: node.createUriNode(CompliantURIs.getPersistentIdentity(uri)),
            [Predicates.SBOL2.version]: node.createStringNode(CompliantURIs.getVersion(uri))
        })

        if(name !== undefined) {
            graph.insertProperties(uri, {
                [Predicates.Dcterms.title]: node.createStringNode(name)
            })
        }

        return new S2Identified(graph, uri)
    }

}

function nameToID(name:string):string {

    // TODO
    return name.replace(/\s/, '_')

}
