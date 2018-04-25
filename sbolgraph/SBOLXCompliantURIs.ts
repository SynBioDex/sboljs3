
import SBOLXGraph from "./SBOLXGraph";
import SXSubComponent from "./sbolx/SXSubComponent";
import * as triple from './triple'
import SXComponent from "./sbolx/SXComponent";
import { Predicates, Types, Specifiers } from "bioterms";
import assert from 'power-assert'
import { SXLocation, SXSequenceFeature, SXThingWithLocation, SXSequenceConstraint } from '.'

export default class CompliantURIs {

    static getComponentDefinitionUri(graphA:SBOLXGraph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        return topLevelPrefix + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getComponentUri(graphA:SBOLXGraph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const existingComponent =
            new SXSubComponent(graphA, uri)

        const containingComponentDefinition:SXComponent =
            existingComponent.containingComponent

        if(containingComponentDefinition === undefined) {

            throw new Error('Component ' + uri + ' not contained by a ComponentDefinition?')

        }

        const containingComponentDefinitionNewUri =
                    CompliantURIs.getComponentDefinitionUri(
                        graphA, containingComponentDefinition.uri, topLevelPrefix, false)

        return containingComponentDefinitionNewUri
                    + '/' + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getSequenceFeatureUri(graphA:SBOLXGraph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const existingSF = new SXSequenceFeature(graphA, uri)

        const containingComponent:SXComponent = existingSF.containingComponent

        if(existingSF === undefined) {

            throw new Error('SequenceFeature ' + uri + ' not contained by a Component?')

        }

        const containingComponentDefinitionNewUri =
                    CompliantURIs.getComponentDefinitionUri(
                        graphA, containingComponent.uri, topLevelPrefix, false)

        return containingComponentDefinitionNewUri
                    + '/' + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getSequenceConstraintUri(graphA:SBOLXGraph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const existingSF = new SXSequenceConstraint(graphA, uri)

        const containingComponent:SXComponent = existingSF.containingComponent

        if(existingSF === undefined) {

            throw new Error(' ' + uri + ' not contained by a Component?')

        }

        const containingComponentDefinitionNewUri =
                    CompliantURIs.getComponentDefinitionUri(
                        graphA, containingComponent.uri, topLevelPrefix, false)

        return containingComponentDefinitionNewUri
                    + '/' + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getLocationUri(graphA:SBOLXGraph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const existingLocation = graphA.uriToFacade(uri)

        if(! (existingLocation instanceof SXLocation)) {
            throw new Error('???')
        }

        const containingThing:SXThingWithLocation|undefined =
            (existingLocation as SXLocation).containingObject as SXThingWithLocation

        if(containingThing === undefined) {

            throw new Error('Location ' + uri + ' not contained?')

        }

        var containingSANewUri


        if(containingThing instanceof SXSubComponent) {
            containingSANewUri = CompliantURIs.getComponentUri(
                graphA, containingThing.uri, topLevelPrefix, false)

        } else {
            containingSANewUri = CompliantURIs.getSequenceFeatureUri(
                graphA, containingThing.uri, topLevelPrefix, false)
        }

        return containingSANewUri
                    + '/' + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getInteractionUri(graphA:SBOLXGraph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const containingModuleDefinition:string|undefined = triple.subjectUri(
            graphA.matchOne(null, Predicates.SBOLX.hasInteraction, uri)
        )

        if(containingModuleDefinition === undefined) {

            throw new Error('Interaction ' + uri + ' not contained by a ModuleDefinition?')

        }

        const containingModuleDefinitionNewUri =
                    CompliantURIs.getComponentUri(
                        graphA, containingModuleDefinition, topLevelPrefix, false)

        return containingModuleDefinitionNewUri
                    + '/' + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getParticipationUri(graphA:SBOLXGraph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const containingInteraction:string|undefined = triple.subjectUri(
            graphA.matchOne(null, Predicates.SBOLX.hasParticipation, uri)
        )

        if(containingInteraction === undefined) {

            throw new Error('Participation ' + uri + ' not contained by an Interaction?')

        }

        const containingInteractionNewUri =
                    CompliantURIs.getInteractionUri(
                        graphA, containingInteraction, topLevelPrefix, false)

        return containingInteractionNewUri
                    + '/' + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getPrefix(uri:string):string {

        const tokens:string[] = uri.split('/')

        return tokens.slice(0, tokens.length - 2).join('/') + '/'

    }

    static getId(uri:string):string {

        const tokens:string[] = uri.split('/')

        return tokens[tokens.length - 2]

    }

    static getVersion(uri:string):string {

        const tokens:string[] = uri.split('/')

        return tokens[tokens.length - 1]

    }

    static getPersistentIdentity(uri:string):string {

        return uri.slice(0, uri.lastIndexOf('/'))
    
    }

    static removePrefix(graph:SBOLXGraph, uri:string, keepVersion:boolean) {

        const prefix = CompliantURIs.getPrefix(uri)

        const uriWithoutPrefix = uri.substr(prefix.length)

        if(keepVersion === false) {

            const version: string | undefined = triple.objectUri(
                graph.matchOne(uri, Predicates.SBOLX.version, null)
            )

            if(version !== undefined) {

                if(!uriWithoutPrefix.endsWith('/' + version)) {
                    throw new Error('no version suffix?')
                }

                if(uriWithoutPrefix.startsWith('/'))
                    throw new Error('???')

                return uriWithoutPrefix.substr(0, uriWithoutPrefix.length - version.length - 1)

            }

        }

        if(uriWithoutPrefix.startsWith('/'))
            throw new Error('???')

        return uriWithoutPrefix

    }

    static getTopLevelPrefixFromSubject(graph:SBOLXGraph, subject:string) {

        const closestTopLevel:string|undefined = graph.findClosestTopLevel(subject)

        if(closestTopLevel === undefined)
            throw new Error('no closest top level?')

        return CompliantURIs.getPrefix(closestTopLevel)
    }

    static checkCompliance(graph:SBOLXGraph) {

        const diff:any[] = []

        graph.match(null, Predicates.a, Types.SBOLX.Component)
            .map(triple.subjectUri)
            .forEach((uri:string) => {

            const topLevelPrefix = CompliantURIs.getTopLevelPrefixFromSubject(graph, uri)

            const compliantUri = CompliantURIs.getComponentDefinitionUri(graph, uri, topLevelPrefix, true)

            if(uri !== compliantUri)
                diff.push({ oldUri: uri, newUri: compliantUri, topLevelPrefix: topLevelPrefix })
        })

        graph.match(null, Predicates.a, Types.SBOLX.SubComponent)
            .map(triple.subjectUri)
            .forEach((uri:string) => {

            const topLevelPrefix = CompliantURIs.getTopLevelPrefixFromSubject(graph, uri)

            const compliantUri = CompliantURIs.getComponentUri(graph, uri, topLevelPrefix, true)

            if(uri !== compliantUri)
                diff.push({ oldUri: uri, newUri: compliantUri, topLevelPrefix: topLevelPrefix })
        })

        graph.match(null, Predicates.a, Types.SBOLX.Interaction)
            .map(triple.subjectUri)
            .forEach((uri:string) => {

            const topLevelPrefix = CompliantURIs.getTopLevelPrefixFromSubject(graph, uri)

            const compliantUri = CompliantURIs.getInteractionUri(graph, uri, topLevelPrefix, true)

            if(uri !== compliantUri)
                diff.push({ oldUri: uri, newUri: compliantUri, topLevelPrefix: topLevelPrefix })
        })

        graph.match(null, Predicates.a, Types.SBOLX.Participation)
            .map(triple.subjectUri)
            .forEach((uri:string) => {

            const topLevelPrefix = CompliantURIs.getTopLevelPrefixFromSubject(graph, uri)

            const compliantUri = CompliantURIs.getParticipationUri(graph, uri, topLevelPrefix, true)

            if(uri !== compliantUri)
                diff.push({ oldUri: uri, newUri: compliantUri, topLevelPrefix: topLevelPrefix })
        })

        return diff
    }

}
