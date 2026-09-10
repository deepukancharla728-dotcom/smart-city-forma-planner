package com.sih.smartcity;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class SeedData {
    @Bean
    CommandLineRunner seed(SiteRepository sites, LayoutRepository layouts) {
        return args -> {
            if(sites.count()==0) {
                sites.save(new Site("Amaravati Smart Growth Zone","Amaravati","Andhra Pradesh",
                    "Large urban expansion candidate for sustainable mixed-use planning.",
                    "Flat alluvial","Road network, river influence, developing urban context",
                    16.5739,80.3575,1.20,90,85,92));
                sites.save(new Site("Visakhapatnam Urban Renewal Zone","Visakhapatnam","Andhra Pradesh",
                    "Urban redevelopment candidate with strong transport connectivity.",
                    "Coastal rolling","Dense urban surroundings, major roads and public transport",
                    17.6868,83.2185,1.50,94,91,84));
            }
            if(layouts.count()==0) {
                layouts.save(new Layout("Eco Grid","Amaravati Smart Growth Zone",
                    "Solar-first mixed-use grid with green corridors.",1.20,92,90,86,82,95,91,94,90,91,96));
                layouts.save(new Layout("Transit Core","Visakhapatnam Urban Renewal Zone",
                    "Transit-oriented compact plan with pedestrian streets.",1.50,84,89,90,78,88,86,82,96,97,88));
                layouts.save(new Layout("Climate Loop","Amaravati Smart Growth Zone",
                    "Loop road, shaded public realm and distributed green spaces.",1.20,89,94,92,90,91,94,91,92,89,95));
            }
        };
    }
}
