package com.sih.smartcity;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import java.util.*;
import java.util.stream.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiController {
    private final SiteRepository sites;
    private final LayoutRepository layouts;

    private final Map<String,String[]> users = Map.of(
        "planner", new String[]{"planner123","PLANNER"},
        "layout", new String[]{"layout123","LAYOUT"},
        "constructor", new String[]{"constructor123","CONSTRUCTOR"}
    );

    public ApiController(SiteRepository sites, LayoutRepository layouts) {
        this.sites=sites; this.layouts=layouts;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest r) {
        String[] u=users.get(r.username);
        if(u==null || !u[0].equals(r.password) || !u[1].equals(r.role))
            return ResponseEntity.status(401).body(new LoginResponse(false,"Invalid login","", ""));
        return ResponseEntity.ok(new LoginResponse(true,"Login successful",u[1], UUID.randomUUID().toString()));
    }

    @GetMapping("/sites")
    public List<Site> getSites(){ return sites.findAll(); }

    @PostMapping("/sites")
    public ResponseEntity<?> addSite(@RequestBody SiteRequest r) {
        if(r.areaKm2 < 1) return ResponseEntity.badRequest().body(Map.of("error","Site must be at least 1 km²."));
        Site s=new Site(r.name,r.city,r.state,r.description,r.terrain,r.surrounding,r.latitude,r.longitude,
                r.areaKm2,r.transport,r.infrastructure,r.landSuitability);
        return ResponseEntity.ok(sites.save(s));
    }

    @PostMapping("/sites/{id}/select")
    public ResponseEntity<?> selectSite(@PathVariable Long id){
        return sites.findById(id).map(s -> ResponseEntity.ok(Map.of("selectedSite",s)))
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/layouts")
    public List<Map<String,Object>> getLayouts(){
        return layouts.findAll().stream().map(l -> {
            Map<String,Object> m=new LinkedHashMap<>();
            m.put("id",l.id); m.put("name",l.name); m.put("siteName",l.siteName);
            m.put("description",l.description); m.put("siteAreaKm2",l.siteAreaKm2);
            m.put("efficiency",l.efficiency());
            m.put("metrics",Map.of("sunlight",l.sunlight,"daylight",l.daylight,"wind",l.wind,
                    "noise",l.noise,"solar",l.solar,"carbon",l.carbon,"terrain",l.terrain,
                    "roads",l.roads,"transport",l.transport,"landscaping",l.landscaping));
            return m;
        }).toList();
    }

    @PostMapping("/layouts")
    public ResponseEntity<?> addLayout(@RequestBody LayoutRequest r){
        Layout l=new Layout(r.name,r.siteName,r.description,r.siteAreaKm2,r.sunlight,r.daylight,r.wind,
                r.noise,r.solar,r.carbon,r.terrain,r.roads,r.transport,r.landscaping);
        return ResponseEntity.ok(layouts.save(l));
    }

    @PostMapping("/layouts/{id}/select")
    public ResponseEntity<?> selectLayout(@PathVariable Long id){
        return layouts.findById(id).map(l -> ResponseEntity.ok(Map.of(
                "selectedLayout",l,"efficiency",l.efficiency())))
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/health")
    public Map<String,String> health(){ return Map.of("status","UP","service","SIH Smart City Planner");}
}
