package com.sih.smartcity;

import jakarta.persistence.*;
import java.util.*;

@Entity
class Site {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public String name, city, state, description, terrain, surrounding;
    public double latitude, longitude, areaKm2;
    public int transport, infrastructure, landSuitability;

    public Site() {}
    public Site(String name,String city,String state,String description,String terrain,String surrounding,
                double latitude,double longitude,double areaKm2,int transport,int infrastructure,int landSuitability) {
        this.name=name; this.city=city; this.state=state; this.description=description;
        this.terrain=terrain; this.surrounding=surrounding; this.latitude=latitude; this.longitude=longitude;
        this.areaKm2=areaKm2; this.transport=transport; this.infrastructure=infrastructure;
        this.landSuitability=landSuitability;
    }
}

@Entity
class Layout {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public String name, siteName, description;
    public double siteAreaKm2;
    public int sunlight, daylight, wind, noise, solar, carbon, terrain, roads, transport, landscaping;

    public Layout() {}
    public Layout(String name,String siteName,String description,double siteAreaKm2,int sunlight,int daylight,
                  int wind,int noise,int solar,int carbon,int terrain,int roads,int transport,int landscaping) {
        this.name=name; this.siteName=siteName; this.description=description; this.siteAreaKm2=siteAreaKm2;
        this.sunlight=sunlight; this.daylight=daylight; this.wind=wind; this.noise=noise; this.solar=solar;
        this.carbon=carbon; this.terrain=terrain; this.roads=roads; this.transport=transport;
        this.landscaping=landscaping;
    }
    public double efficiency() {
        // Transparent SIH prototype score, not an Autodesk-certified metric.
        return Math.round((
            sunlight*.15 + daylight*.15 + wind*.12 + noise*.08 + solar*.15 +
            carbon*.15 + terrain*.10 + roads*.04 + transport*.04 + landscaping*.02
        )*100.0)/100.0;
    }
}

interface SiteRepository extends org.springframework.data.jpa.repository.JpaRepository<Site,Long> {}
interface LayoutRepository extends org.springframework.data.jpa.repository.JpaRepository<Layout,Long> {}

class LoginRequest { public String username, password, role; }
class LoginResponse { public boolean ok; public String message, role, token;
    LoginResponse(boolean ok,String message,String role,String token){this.ok=ok;this.message=message;this.role=role;this.token=token;}
}
class SiteRequest {
    public String name, city, state, description, terrain, surrounding;
    public double latitude, longitude, areaKm2;
    public int transport, infrastructure, landSuitability;
}
class LayoutRequest {
    public String name, siteName, description;
    public double siteAreaKm2;
    public int sunlight, daylight, wind, noise, solar, carbon, terrain, roads, transport, landscaping;
}
