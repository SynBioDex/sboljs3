
import SbolGraph from "./SbolGraph";
import ComponentInstanceFacade from "./facade/ComponentInstanceFacade";
import * as triple from 'sbolgraph/triple'
import ComponentDefinitionFacade from "sbolgraph/facade/ComponentDefinitionFacade";
import { Predicates, Types, Specifiers } from "terms";
import assert from 'power-assert'
import SequenceAnnotationFacade from "sbolgraph/facade/SequenceAnnotationFacade";
import LocationFacade from "sbolgraph/facade/LocationFacade";

export default class CompliantURIs {

    static getComponentDefinitionUri(graphA:SbolGraph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        return topLevelPrefix + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getComponentUri(graphA:SbolGraph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const existingComponent =
            new ComponentInstanceFacade(graphA, uri)

        const containingComponentDefinition:ComponentDefinitionFacade =
            existingComponent.containingComponentDefinition

        if(containingComponentDefinition === undefined) {

            throw new Error('Component ' + uri + ' not contained by a ComponentDefinition?')

        }

        const containingComponentDefinitionNewUri =
                    CompliantURIs.getComponentDefinitionUri(
                        graphA, containingComponentDefinition.uri, topLevelPrefix, false)

        return containingComponentDefinitionNewUri
                    + '/' + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getSequenceAnnotationUri(graphA:SbolGraph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const existingSA =
            new SequenceAnnotationFacade(graphA, uri)

        const containingComponentDefinition:ComponentDefinitionFacade =
            existingSA.containingComponentDefinition

        if(existingSA === undefined) {

            throw new Error('SequenceAnnotation ' + uri + ' not contained by a ComponentDefinition?')

        }

        const containingComponentDefinitionNewUri =
                    CompliantURIs.getComponentDefinitionUri(
                        graphA, containingComponentDefinition.uri, topLevelPrefix, false)

        return containingComponentDefinitionNewUri
                    + '/' + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getLocationUri(graphA:SbolGraph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const existingLocation = graphA.uriToFacade(uri)

        if(! (existingLocation instanceof LocationFacade)) {
            throw new Error('???')
        }

        const containingSA:SequenceAnnotationFacade =
            (existingLocation as LocationFacade).containingSequenceAnnotation

        if(containingSA === undefined) {

            throw new Error('Location ' + uri + ' not contained by a SequenceAnnotation?')

        }

        const containingSANewUri =
                    CompliantURIs.getSequenceAnnotationUri(
                        graphA, containingSA.uri, topLevelPrefix, false)

        return containingSANewUri
                    + '/' + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getFunctionalComponentUri(graphA:SbolGraph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const containingModuleDefinition:string|undefined = triple.subjectUri(
            graphA.matchOne(null, Predicates.SBOL2.functionalComponent, uri)
        )

        if(containingModuleDefinition === undefined) {

            throw new Error('FunctionalComponent ' + uri + ' not contained by a ModuleDefinition?')

        }

        const containingModuleDefinitionNewUri =
                    CompliantURIs.getModuleDefinitionUri(
                        graphA, containingModuleDefinition, topLevelPrefix, false)

        return containingModuleDefinitionNewUri
                    + '/' + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getInteractionUri(graphA:SbolGraph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const containingModuleDefinition:string|undefined = triple.subjectUri(
            graphA.matchOne(null, Predicates.SBOL2.interaction, uri)
        )

        if(containingModuleDefinition === undefined) {

            throw new Error('Interaction ' + uri + ' not contained by a ModuleDefinition?')

        }

        const containingModuleDefinitionNewUri =
                    CompliantURIs.getModuleDefinitionUri(
                        graphA, containingModuleDefinition, topLevelPrefix, false)

        return containingModuleDefinitionNewUri
                    + '/' + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getModuleDefinitionUri(graphA:SbolGraph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        return topLevelPrefix + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getModuleUri(graphA:SbolGraph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const containingModuleDefinition:string|undefined = triple.subjectUri(
            graphA.matchOne(null, Predicates.SBOL2.module, uri)
        )

        if(containingModuleDefinition === undefined) {

            throw new Error('Module ' + uri + ' not contained by a ModuleDefinition?')

        }

        const containingModuleDefinitionNewUri =
                    CompliantURIs.getModuleDefinitionUri(
                        graphA, containingModuleDefinition, topLevelPrefix, false)

        return containingModuleDefinitionNewUri
                    + '/' + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getParticipationUri(graphA:SbolGraph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const containingInteraction:string|undefined = triple.subjectUri(
            graphA.matchOne(null, Predicates.SBOL2.participation, uri)
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

    static getDisplayId(uri:string):string {

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

    static removePrefix(graph:SbolGraph, uri:string, keepVersion:boolean) {

        const prefix = CompliantURIs.getPrefix(uri)

        const uriWithoutPrefix = uri.substr(prefix.length)

        if(keepVersion === false) {

            const version: string | undefined = triple.objectUri(
                graph.matchOne(uri, Predicates.SBOL2.version, null)
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

    static getTopLevelPrefixFromSubject(graph:SbolGraph, subject:string) {

        const closestTopLevel:string|undefined = graph.findClosestTopLevel(subject)

        if(closestTopLevel === undefined)
            throw new Error('no closest top level?')

        return CompliantURIs.getPrefix(closestTopLevel)
    }

    static checkCompliance(graph:SbolGraph) {

        const diff:any[] = []

        graph.match(null, Predicates.a, Types.SBOL2.ComponentDefinition)
            .map(triple.subjectUri)
            .forEach((uri:string) => {

            const topLevelPrefix = CompliantURIs.getTopLevelPrefixFromSubject(graph, uri)

            const compliantUri = CompliantURIs.getComponentDefinitionUri(graph, uri, topLevelPrefix, true)

            if(uri !== compliantUri)
                diff.push({ oldUri: uri, newUri: compliantUri, topLevelPrefix: topLevelPrefix })
        })

        graph.match(null, Predicates.a, Types.SBOL2.ModuleDefinition)
            .map(triple.subjectUri)
            .forEach((uri:string) => {

            const topLevelPrefix = CompliantURIs.getTopLevelPrefixFromSubject(graph, uri)

            const compliantUri = CompliantURIs.getModuleDefinitionUri(graph, uri, topLevelPrefix, true)

            if(uri !== compliantUri)
                diff.push({ oldUri: uri, newUri: compliantUri, topLevelPrefix: topLevelPrefix })
        })

        graph.match(null, Predicates.a, Types.SBOL2.Module)
            .map(triple.subjectUri)
            .forEach((uri:string) => {

            const topLevelPrefix = CompliantURIs.getTopLevelPrefixFromSubject(graph, uri)

            const compliantUri = CompliantURIs.getModuleUri(graph, uri, topLevelPrefix, true)

            if(uri !== compliantUri)
                diff.push({ oldUri: uri, newUri: compliantUri, topLevelPrefix: topLevelPrefix })
        })

        graph.match(null, Predicates.a, Types.SBOL2.Component)
            .map(triple.subjectUri)
            .forEach((uri:string) => {

            const topLevelPrefix = CompliantURIs.getTopLevelPrefixFromSubject(graph, uri)

            const compliantUri = CompliantURIs.getComponentUri(graph, uri, topLevelPrefix, true)

            if(uri !== compliantUri)
                diff.push({ oldUri: uri, newUri: compliantUri, topLevelPrefix: topLevelPrefix })
        })

        graph.match(null, Predicates.a, Types.SBOL2.FunctionalComponent)
            .map(triple.subjectUri)
            .forEach((uri:string) => {

            const topLevelPrefix = CompliantURIs.getTopLevelPrefixFromSubject(graph, uri)

            const compliantUri = CompliantURIs.getFunctionalComponentUri(graph, uri, topLevelPrefix, true)

            if(uri !== compliantUri)
                diff.push({ oldUri: uri, newUri: compliantUri, topLevelPrefix: topLevelPrefix })
        })

        graph.match(null, Predicates.a, Types.SBOL2.Interaction)
            .map(triple.subjectUri)
            .forEach((uri:string) => {

            const topLevelPrefix = CompliantURIs.getTopLevelPrefixFromSubject(graph, uri)

            const compliantUri = CompliantURIs.getInteractionUri(graph, uri, topLevelPrefix, true)

            if(uri !== compliantUri)
                diff.push({ oldUri: uri, newUri: compliantUri, topLevelPrefix: topLevelPrefix })
        })

        graph.match(null, Predicates.a, Types.SBOL2.Participation)
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