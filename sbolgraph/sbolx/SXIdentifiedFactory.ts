
import SXIdentified from "./SXIdentified";
import { Predicates } from 'sbolterms'
import * as node from '../node'
import CompliantURIs from '../SBOL2CompliantURIs'
import SBOLXGraph from '../SBOLXGraph'

export default class SXIdentifiedFactory {
    
    static createTopLevel(graph:SBOLXGraph,
                          type:string,
                          uriPrefix:string,
                          id:string,
                          name:string|undefined,
                          version?:string|undefined):SXIdentified {

        id = nameToID(id)

        if(version === undefined)
            version = '1'

        const uri:string = graph.generateURI(uriPrefix + id + '$n?$/' + version)

        graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOLX.id]: node.createStringNode(CompliantURIs.getDisplayId(uri)),
            [Predicates.SBOLX.persistentIdentity]: node.createUriNode(CompliantURIs.getPersistentIdentity(uri)),
            [Predicates.SBOLX.version]: node.createStringNode(CompliantURIs.getVersion(uri))
        })

        if(name !== undefined) {
            graph.insertProperties(uri, {
                [Predicates.Dcterms.title]: node.createStringNode(name)
            })
        }

        return new SXIdentified(graph, uri)

    }

    static createChild(graph:SBOLXGraph,
                    type:string,
                    parent:SXIdentified,
                    id:string,
                    name:string|undefined,
                    version?:string|undefined):SXIdentified {

        id = nameToID(id)

        if(version === undefined)
            version = '1'

        const uri:string = graph.generateURI(
            parent.persistentIdentity + '/' + id + '$n?$/' + version)

        graph.insertProperties(uri, {
            [Predicates.a]: node.createUriNode(type),
            [Predicates.SBOLX.id]: node.createStringNode(CompliantURIs.getDisplayId(uri)),
            [Predicates.SBOLX.persistentIdentity]: node.createUriNode(CompliantURIs.getPersistentIdentity(uri)),
            [Predicates.SBOLX.version]: node.createStringNode(CompliantURIs.getVersion(uri))
        })

        if(name !== undefined) {
            graph.insertProperties(uri, {
                [Predicates.Dcterms.title]: node.createStringNode(name)
            })
        }

        return new SXIdentified(graph, uri)
    }

}

function nameToID(name:string):string {

    // TODO
    return name.replace(/\s/, '_')

}
