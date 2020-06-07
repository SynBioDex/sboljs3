
import S3Identified from './S3Identified'
import S3Location from './S3Location'
import S3Range from './S3Range'
import S3IdentifiedFactory from './S3IdentifiedFactory'

import { node } from 'rdfoo'

import { Predicates, Types } from 'bioterms'
import S3OrientedLocation from './S3OrientedLocation';

export default class S3ThingWithLocation extends S3Identified {

    get locations():Array<S3Location> {

        return this.getUriProperties(Predicates.SBOL3.location)
                   .map((uri:string) => this.view.uriToFacade(uri) as S3Location)
    }

    get rangeLocations():Array<S3Range> {

        return this.locations.filter((location:S3Identified) => {
            return location.objectType === Types.SBOL3.Range
        }).map((identified:S3Identified) => {
            return new S3Range(this.view, identified.uri)
        })

    }

    get rangeMin():number|null {

        var n:number = Number.MAX_VALUE

        this.rangeLocations.forEach((range:S3Range) => {

            const start:number|undefined = range.start
            const end:number|undefined = range.end

            if(start !== undefined && start < n)
                n = start

            if(end !== undefined && end < n)
                n = end
        })

        return n === Number.MAX_VALUE ? null : n
    }

    get rangeMax():number|null {

        var n:number = Number.MIN_VALUE

        this.rangeLocations.forEach((range:S3Range) => {

            const start:number|undefined = range.start
            const end:number|undefined = range.end

            if(start !== undefined && start > n)
                n = start

            if(end !== undefined && end > n)
                n = end
        })

        return n === Number.MIN_VALUE ? null : n
    }

    hasFixedLocation():boolean {

        const locations = this.locations

        for(var i = 0; i < locations.length; ++ i) {

            if(locations[i].isFixed())
                return true

        }

        return false
    }

    addRange(start:number, end:number):S3Range {

        const id:string = 'range'

        const identified:S3Identified =
            S3IdentifiedFactory.createChild(this.view, Types.SBOL3.Range, this, Predicates.SBOL3.location, id, undefined)

        const range:S3Range = new S3Range(this.view, identified.uri)

        range.start = start
        range.end = end

        return range
    }

    addOrientedLocation():S3OrientedLocation {

        const loc:S3Identified = S3IdentifiedFactory.createChild(this.view, Types.SBOL3.OrientedLocation, this, Predicates.SBOL3.location, 'location', undefined)

        return new S3OrientedLocation(loc.view, loc.uri)
    }

    setOrientation(orientation:string) {

        let hadOrientedLocation = false

        if(this.locations.length > 0) {
            for(let location of this.locations) {
                if(location instanceof S3OrientedLocation) {
                    location.orientation = orientation
                    hadOrientedLocation = true
                }
            }
        }

        if(hadOrientedLocation)
            return

        let loc = this.addOrientedLocation()
        loc.orientation = orientation
    }

    getOrientation():string|undefined {

        for (let location of this.locations) {
            if (location instanceof S3OrientedLocation) {
                return location.orientation
            }
        }

        return undefined
    }

}
