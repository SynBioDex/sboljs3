

import { Types, Predicates, Specifiers } from 'sbolterms'
import SBOLGraph from "./SBOLGraph";

import * as node from './node'
import * as triple from './triple'

import CompliantURIs from './CompliantURIs'

export default class SBOLCopier {

    static copy(graphA:SBOLGraph, graphB:SBOLGraph, uri:string, newPrefix:string):string {

        const copier:SBOLCopier = new SBOLCopier(graphA, graphB, newPrefix)

        return copier.copy(uri)
    }


    graphA:SBOLGraph
    graphB:SBOLGraph

    oldToNewUriMap:Map<string,string>

    newPrefix:string

    private constructor(graphA:SBOLGraph, graphB:SBOLGraph, newPrefix:string) {
        this.oldToNewUriMap = new Map<string, string>()
        this.graphA = graphA
        this.graphB = graphB
        this.newPrefix = newPrefix
    }

    private copy(uri:string):string {

        const type:string = this.graphA.getType(uri)

        switch(type) {
            case Types.SBOL2.ComponentDefinition:
                return this.copyComponentDefinition(uri)
            case Types.SBOL2.ModuleDefinition:
                return this.copyModuleDefinition(uri)
        }

        throw new Error('cant copy that')
    }

    private uniqueUri(uri:string) {

        while(this.graphB.hasMatch(uri, null, null)) {

            uri = incrementSuffix(uri)
        }

        return uri

        function incrementSuffix(uri:string):string {

            const displayId:string = CompliantURIs.getDisplayId(uri)

            const tokens:string[] = displayId.split('_')

            const suffix:string = tokens[tokens.length - 1]

            if(suffix !== undefined && !isNaN(parseInt(suffix))) {

                const actualDisplayId:string = displayId.split('_')[0]

                const newSuffix = (parseInt(suffix) + 1) + ''

                return CompliantURIs.getPrefix(uri) + actualDisplayId + '_' + newSuffix + '/' + CompliantURIs.getVersion(uri)

            } else {

                return CompliantURIs.getPrefix(uri) + displayId + '_2/' + CompliantURIs.getVersion(uri)

            }
        }

    }

    private copyComponentDefinition(uri:string):string {

        const alreadyMapped:string|undefined = this.oldToNewUriMap.get(uri)

        if(alreadyMapped !== undefined)
            return alreadyMapped

        const newUri = this.uniqueUri(
            CompliantURIs.getComponentDefinitionUri(this.graphA, uri, this.newPrefix, true)
        )

        this.oldToNewUriMap.set(uri, newUri)


        console.log(uri + ' => ' + newUri)

        this.graphB.add(newUri, Predicates.Prov.wasDerivedFrom, node.createUriNode(uri))

        const triples = this.graphA.match(uri, null, null)

        var objectUri:string|undefined = undefined

        triples.forEach((t) => {

            switch(triple.predicateUri(t)) {

                case Predicates.Prov.wasDerivedFrom:
                    break

                case Predicates.SBOL2.persistentIdentity:

                    this.graphB.add(newUri, Predicates.SBOL2.persistentIdentity, node.createUriNode(newUri))
                    break

                case Predicates.SBOL2.component:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(newUri, Predicates.SBOL2.component, node.createUriNode(
                        this.copyComponentInstantiation(objectUri)
                    ))

                    break

                case Predicates.SBOL2.module:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(newUri, Predicates.SBOL2.module, node.createUriNode(
                        this.copyModuleInstantiation(objectUri)
                    ))

                    break

                case Predicates.SBOL2.interaction:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(newUri, Predicates.SBOL2.interaction, node.createUriNode(
                        this.copyInteraction(objectUri)
                    ))

                    break

                case Predicates.SBOL2.sequenceAnnotation:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(newUri, Predicates.SBOL2.sequenceAnnotation, node.createUriNode(
                        this.copySequenceAnnotation(objectUri)
                    ))

                    break

                default:

                    this.graphB.add(newUri, t.predicate, t.object)
                    break
            }

        })

        return newUri

    }

    private copyComponentInstantiation(uri:string):string {

        const alreadyMapped:string|undefined = this.oldToNewUriMap.get(uri)

        if(alreadyMapped !== undefined)
            return alreadyMapped

        const newUri = this.uniqueUri(
            CompliantURIs.getComponentUri(this.graphA, uri, this.newPrefix, true)
        )

        this.oldToNewUriMap.set(uri, newUri)



        this.graphB.add(newUri, Predicates.Prov.wasDerivedFrom, node.createUriNode(uri))

        const triples = this.graphA.match(uri, null, null)

        var objectUri:string|undefined = undefined

        triples.forEach((t) => {

            switch(triple.predicateUri(t)) {

                case Predicates.Prov.wasDerivedFrom:
                    break

                case Predicates.SBOL2.persistentIdentity:
                    this.graphB.add(newUri, Predicates.SBOL2.persistentIdentity, node.createUriNode(newUri))
                    break

                case Predicates.SBOL2.definition:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(
                        newUri,
                        Predicates.SBOL2.definition, 
                        node.createUriNode(this.copyComponentDefinition(objectUri))
                    )

                    break

                default:

                    this.graphB.add(newUri, t.predicate, t.object)
                    break
            }

        })

        return newUri
    }

    private copyFunctionalComponent(uri:string):string {

        const alreadyMapped:string|undefined = this.oldToNewUriMap.get(uri)

        if(alreadyMapped !== undefined)
            return alreadyMapped

        const newUri:string = this.uniqueUri(
            CompliantURIs.getFunctionalComponentUri(this.graphA, uri, this.newPrefix, true)
        )

        this.oldToNewUriMap.set(uri, newUri)


        this.graphB.add(newUri, Predicates.Prov.wasDerivedFrom, node.createUriNode(uri))

        const triples = this.graphA.match(uri, null, null)

        var objectUri:string|undefined = undefined

        triples.forEach((t) => {

            switch(triple.predicateUri(t)) {

                case Predicates.Prov.wasDerivedFrom:
                    break

                case Predicates.SBOL2.persistentIdentity:

                    this.graphB.add(newUri, Predicates.SBOL2.persistentIdentity, node.createUriNode(newUri))
                    break

                case Predicates.SBOL2.definition:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(
                        newUri,
                        Predicates.SBOL2.definition,
                        node.createUriNode(this.copyComponentDefinition(objectUri))
                    )

                    break


                default:

                    this.graphB.add(newUri, t.predicate, t.object)
                    break
            }

        })

        return newUri
    }

    private copyInteraction(uri:string):string {

        const alreadyMapped:string|undefined = this.oldToNewUriMap.get(uri)

        if(alreadyMapped !== undefined)
            return alreadyMapped

        const newUri:string = this.uniqueUri(
            CompliantURIs.getInteractionUri(this.graphA, uri, this.newPrefix, true)
        )

        this.oldToNewUriMap.set(uri, newUri)


        this.graphB.add(newUri, Predicates.Prov.wasDerivedFrom, node.createUriNode(uri))

        const triples = this.graphA.match(uri, null, null)

        var objectUri:string|undefined = undefined

        triples.forEach((t) => {

            switch(triple.predicateUri(t)) {

                case Predicates.Prov.wasDerivedFrom:
                    break

                case Predicates.SBOL2.persistentIdentity:

                    this.graphB.add(newUri, Predicates.SBOL2.persistentIdentity, node.createUriNode(newUri))
                    break

                case Predicates.SBOL2.participation:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(
                        newUri,
                        Predicates.SBOL2.participation,
                        node.createUriNode(this.copyParticipation(objectUri))
                    )

                    break

                default:

                    this.graphB.add(newUri, t.predicate, t.object)
                    break
            }

        })

        return newUri
    }

    private copyModuleDefinition(uri:string):string {

        const alreadyMapped:string|undefined = this.oldToNewUriMap.get(uri)

        if(alreadyMapped !== undefined)
            return alreadyMapped

        const newUri = this.uniqueUri(
            CompliantURIs.getModuleDefinitionUri(this.graphA, uri, this.newPrefix, true)
        )

        this.oldToNewUriMap.set(uri, newUri)


        this.graphB.add(newUri, Predicates.Prov.wasDerivedFrom, node.createUriNode(uri))

        const triples = this.graphA.match(uri, null, null)

        var objectUri:string|undefined = undefined


        triples.forEach((t) => {

            switch(triple.predicateUri(t)) {

                case Predicates.Prov.wasDerivedFrom:
                    break

                case Predicates.SBOL2.persistentIdentity:
                    this.graphB.add(newUri, Predicates.SBOL2.persistentIdentity, node.createUriNode(newUri))
                    break

                case Predicates.SBOL2.functionalComponent:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(
                        newUri,
                        Predicates.SBOL2.functionalComponent, 
                        node.createUriNode(this.copyFunctionalComponent(objectUri))
                    )

                    break

                case Predicates.SBOL2.module:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(
                        newUri,
                        Predicates.SBOL2.module,
                        node.createUriNode(this.copyModuleInstantiation(objectUri))
                    )

                    break

                case Predicates.SBOL2.interaction:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(
                        newUri,
                        Predicates.SBOL2.interaction,
                        node.createUriNode(this.copyInteraction(objectUri))
                    )

                    break

                default:

                    this.graphB.add(newUri, t.predicate, t.object)
                    break
            }

        })

        return newUri

    }
    
    private copyModuleInstantiation(uri:string):string {

        const alreadyMapped:string|undefined = this.oldToNewUriMap.get(uri)

        if(alreadyMapped !== undefined)
            return alreadyMapped

        const newUri = this.uniqueUri(
            CompliantURIs.getModuleUri(this.graphA, uri, this.newPrefix, true)
        )

        this.oldToNewUriMap.set(uri, newUri)


        this.graphB.add(newUri, Predicates.Prov.wasDerivedFrom, node.createUriNode(uri))

        const triples = this.graphA.match(uri, null, null)

        var objectUri:string|undefined = undefined

        triples.forEach((t) => {

            switch(triple.predicateUri(t)) {

                case Predicates.Prov.wasDerivedFrom:
                    break

                case Predicates.SBOL2.persistentIdentity:
                    this.graphB.add(newUri, Predicates.SBOL2.persistentIdentity, node.createUriNode(newUri))
                    break

                // 1711
                case Predicates.SBOL2.definition:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(
                        newUri,
                        Predicates.SBOL2.definition,
                        node.createUriNode(this.copyModuleDefinition(objectUri))
                    )

                    break

                default:

                    this.graphB.add(newUri, t.predicate, t.object)
                    break
            }

        })

        return newUri
    }

    private copyParticipation(uri:string):string {

        const alreadyMapped:string|undefined = this.oldToNewUriMap.get(uri)

        if(alreadyMapped !== undefined)
            return alreadyMapped

        const newUri = this.uniqueUri(
            CompliantURIs.getParticipationUri(this.graphA, uri, this.newPrefix, true)
        )

        this.oldToNewUriMap.set(uri, newUri)


        this.graphB.add(newUri, Predicates.Prov.wasDerivedFrom, node.createUriNode(uri))

        const triples = this.graphA.match(uri, null, null)

        var objectUri:string|undefined = undefined

        triples.forEach((t) => {

            switch(triple.predicateUri(t)) {

                case Predicates.Prov.wasDerivedFrom:
                    break

                case Predicates.SBOL2.persistentIdentity:
                    this.graphB.add(newUri, Predicates.SBOL2.persistentIdentity, node.createUriNode(newUri))
                    break

                case Predicates.SBOL2.participant:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(
                        newUri,
                        Predicates.SBOL2.definition, 
                        node.createUriNode(this.copyFunctionalComponent(objectUri))
                    )

                    break

                default:

                    this.graphB.add(newUri, t.predicate, t.object)
                    break
            }

        })

        return newUri
    }

    private copySequenceAnnotation(uri:string):string {

        const alreadyMapped:string|undefined = this.oldToNewUriMap.get(uri)

        if(alreadyMapped !== undefined)
            return alreadyMapped

        const newUri = this.uniqueUri(
            CompliantURIs.getSequenceAnnotationUri(this.graphA, uri, this.newPrefix, true)
        )

        this.oldToNewUriMap.set(uri, newUri)



        this.graphB.add(newUri, Predicates.Prov.wasDerivedFrom, node.createUriNode(uri))

        const triples = this.graphA.match(uri, null, null)

        var objectUri:string|undefined = undefined

        triples.forEach((t) => {

            switch(triple.predicateUri(t)) {

                case Predicates.Prov.wasDerivedFrom:
                    break

                case Predicates.SBOL2.persistentIdentity:
                    this.graphB.add(newUri, Predicates.SBOL2.persistentIdentity, node.createUriNode(newUri))
                    break

                case Predicates.SBOL2.location:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(
                        newUri,
                        Predicates.SBOL2.location, 
                        node.createUriNode(this.copyLocation(objectUri))
                    )

                    break

                case Predicates.SBOL2.component:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(
                        newUri,
                        Predicates.SBOL2.component, 
                        node.createUriNode(this.copyComponentInstantiation(objectUri))
                    )

                    break

                default:

                    this.graphB.add(newUri, t.predicate, t.object)
                    break
            }

        })

        return newUri
    }

    private copyLocation(uri:string):string {

        const alreadyMapped:string|undefined = this.oldToNewUriMap.get(uri)

        if(alreadyMapped !== undefined)
            return alreadyMapped

        const newUri = this.uniqueUri(
            CompliantURIs.getLocationUri(this.graphA, uri, this.newPrefix, true)
        )

        this.oldToNewUriMap.set(uri, newUri)



        this.graphB.add(newUri, Predicates.Prov.wasDerivedFrom, node.createUriNode(uri))

        const triples = this.graphA.match(uri, null, null)

        var objectUri:string|undefined = undefined

        triples.forEach((t) => {

            switch(triple.predicateUri(t)) {

                case Predicates.Prov.wasDerivedFrom:
                    break

                case Predicates.SBOL2.persistentIdentity:
                    this.graphB.add(newUri, Predicates.SBOL2.persistentIdentity, node.createUriNode(newUri))
                    break

                default:

                    this.graphB.add(newUri, t.predicate, t.object)
                    break
            }

        })

        return newUri
    }
}
