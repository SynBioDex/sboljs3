

import { Types, Predicates, Specifiers } from 'sbolterms'
import SBOLXGraph from "./SBOLXGraph";

import * as node from './node'
import * as triple from './triple'

import CompliantURIs from './SBOLXCompliantURIs'

export default class SBOLXCopier {

    static copy(graphA:SBOLXGraph, graphB:SBOLXGraph, uri:string, newPrefix:string):string {

        const copier:SBOLXCopier = new SBOLXCopier(graphA, graphB, newPrefix)

        return copier.copy(uri)
    }


    graphA:SBOLXGraph
    graphB:SBOLXGraph

    oldToNewUriMap:Map<string,string>

    newPrefix:string

    private constructor(graphA:SBOLXGraph, graphB:SBOLXGraph, newPrefix:string) {
        this.oldToNewUriMap = new Map<string, string>()
        this.graphA = graphA
        this.graphB = graphB
        this.newPrefix = newPrefix
    }

    private copy(uri:string):string {

        const type:string = this.graphA.getType(uri)

        switch(type) {
            case Types.SBOLX.Component:
                return this.copyComponent(uri)
        }

        throw new Error('cant copy that')
    }

    private uniqueUri(uri:string) {

        while(this.graphB.hasMatch(uri, null, null)) {

            uri = incrementSuffix(uri)
        }

        return uri

        function incrementSuffix(uri:string):string {

            const displayId:string = CompliantURIs.getId(uri)

            const tokens:string[] = displayId.split('_')

            const suffix:string = tokens[tokens.length - 1]

            if(suffix !== undefined && !isNaN(parseInt(suffix))) {

                const actualId:string = displayId.split('_')[0]

                const newSuffix = (parseInt(suffix) + 1) + ''

                return CompliantURIs.getPrefix(uri) + actualId + '_' + newSuffix + '/' + CompliantURIs.getVersion(uri)

            } else {

                return CompliantURIs.getPrefix(uri) + displayId + '_2/' + CompliantURIs.getVersion(uri)

            }
        }

    }

    private copyComponent(uri:string):string {

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

                case Predicates.SBOLX.persistentIdentity:

                    this.graphB.add(newUri, Predicates.SBOLX.persistentIdentity, node.createUriNode(newUri))
                    break

                case Predicates.SBOLX.hasSubComponent:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(newUri, Predicates.SBOLX.hasSubComponent, node.createUriNode(
                        this.copySubComponent(objectUri)
                    ))

                    break

                case Predicates.SBOLX.hasInteraction:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(newUri, Predicates.SBOLX.hasInteraction, node.createUriNode(
                        this.copyInteraction(objectUri)
                    ))

                    break

                case Predicates.SBOLX.hasSequenceFeature:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(newUri, Predicates.SBOLX.hasSequenceFeature, node.createUriNode(
                        this.copySequenceFeature(objectUri)
                    ))

                    break

                case Predicates.SBOLX.hasSequenceConstraint:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(newUri, Predicates.SBOLX.hasSequenceConstraint, node.createUriNode(
                        this.copySequenceConstraint(objectUri)
                    ))

                    break

                default:

                    this.graphB.add(newUri, t.predicate, t.object)
                    break
            }

        })

        return newUri

    }

    private copySubComponent(uri:string):string {

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

                case Predicates.SBOLX.persistentIdentity:
                    this.graphB.add(newUri, Predicates.SBOLX.persistentIdentity, node.createUriNode(newUri))
                    break

                case Predicates.SBOLX.instanceOf:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(
                        newUri,
                        Predicates.SBOLX.instanceOf,
                        node.createUriNode(this.copyComponent(objectUri))
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

                case Predicates.SBOLX.persistentIdentity:

                    this.graphB.add(newUri, Predicates.SBOLX.persistentIdentity, node.createUriNode(newUri))
                    break

                case Predicates.SBOLX.hasParticipation:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(
                        newUri,
                        Predicates.SBOLX.hasParticipation,
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

                case Predicates.SBOLX.persistentIdentity:
                    this.graphB.add(newUri, Predicates.SBOLX.persistentIdentity, node.createUriNode(newUri))
                    break

                case Predicates.SBOLX.participant:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(
                        newUri,
                        Predicates.SBOLX.participant, 
                        node.createUriNode(this.copySubComponent(objectUri))
                    )

                    break

                default:

                    this.graphB.add(newUri, t.predicate, t.object)
                    break
            }

        })

        return newUri
    }

    private copySequenceFeature(uri:string):string {

        const alreadyMapped:string|undefined = this.oldToNewUriMap.get(uri)

        if(alreadyMapped !== undefined)
            return alreadyMapped

        const newUri = this.uniqueUri(
            CompliantURIs.getSequenceFeatureUri(this.graphA, uri, this.newPrefix, true)
        )

        this.oldToNewUriMap.set(uri, newUri)



        this.graphB.add(newUri, Predicates.Prov.wasDerivedFrom, node.createUriNode(uri))

        const triples = this.graphA.match(uri, null, null)

        var objectUri:string|undefined = undefined

        triples.forEach((t) => {

            switch(triple.predicateUri(t)) {

                case Predicates.Prov.wasDerivedFrom:
                    break

                case Predicates.SBOLX.persistentIdentity:
                    this.graphB.add(newUri, Predicates.SBOLX.persistentIdentity, node.createUriNode(newUri))
                    break

                case Predicates.SBOLX.hasLocation:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(
                        newUri,
                        Predicates.SBOLX.hasLocation, 
                        node.createUriNode(this.copyLocation(objectUri))
                    )

                    break

                default:

                    this.graphB.add(newUri, t.predicate, t.object)
                    break
            }

        })

        return newUri
    }

    private copySequenceConstraint(uri:string):string {

        const alreadyMapped:string|undefined = this.oldToNewUriMap.get(uri)

        if(alreadyMapped !== undefined)
            return alreadyMapped

        const newUri = this.uniqueUri(
            CompliantURIs.getSequenceConstraintUri(this.graphA, uri, this.newPrefix, true)
        )

        this.oldToNewUriMap.set(uri, newUri)



        this.graphB.add(newUri, Predicates.Prov.wasDerivedFrom, node.createUriNode(uri))

        const triples = this.graphA.match(uri, null, null)

        var objectUri:string|undefined = undefined

        triples.forEach((t) => {

            switch(triple.predicateUri(t)) {

                case Predicates.Prov.wasDerivedFrom:
                    break

                case Predicates.SBOLX.persistentIdentity:
                    this.graphB.add(newUri, Predicates.SBOLX.persistentIdentity, node.createUriNode(newUri))
                    break

                case Predicates.SBOLX.constraintSubject:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(
                        newUri,
                        Predicates.SBOLX.constraintSubject, 
                        node.createUriNode(objectUri)
                    )

                    break

                case Predicates.SBOLX.constraintObject:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(
                        newUri,
                        Predicates.SBOLX.constraintObject, 
                        node.createUriNode(objectUri)
                    )

                    break

                case Predicates.SBOLX.constraintRestriction:

                    if((objectUri = triple.objectUri(t)) === undefined)
                        throw new Error('objectUri is undefined')

                    this.graphB.add(
                        newUri,
                        Predicates.SBOLX.constraintRestriction,
                        node.createUriNode(objectUri)
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

                case Predicates.SBOLX.persistentIdentity:
                    this.graphB.add(newUri, Predicates.SBOLX.persistentIdentity, node.createUriNode(newUri))
                    break

                default:

                    this.graphB.add(newUri, t.predicate, t.object)
                    break
            }

        })

        return newUri
    }
}
