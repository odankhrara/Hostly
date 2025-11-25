#!/usr/bin/env python3
"""
Generate JMeter Test Plan for Hostly Performance Testing
This script creates a .jmx file for testing critical APIs
"""

import xml.etree.ElementTree as ET
from xml.dom import minidom
from datetime import datetime

def create_jmeter_test_plan():
    """Create JMeter test plan XML structure"""
    
    # Root element
    jmeterTestPlan = ET.Element('jmeterTestPlan', version='1.2', properties='5.0', jmeter='5.6.3')
    hashTree = ET.SubElement(jmeterTestPlan, 'hashTree')
    
    # Test Plan
    testPlan = ET.SubElement(hashTree, 'TestPlan', guiclass='TestPlanGui', testclass='TestPlan', testname='Hostly Performance Test Plan', enabled='true')
    ET.SubElement(testPlan, 'stringProp', name='TestPlan.comments').text = 'Performance test for Hostly APIs: Authentication, Property Search, Booking Processing'
    ET.SubElement(testPlan, 'boolProp', name='TestPlan.functional_mode').text = 'false'
    ET.SubElement(testPlan, 'boolProp', name='TestPlan.serialize_threadgroups').text = 'false'
    ET.SubElement(testPlan, 'stringProp', name='TestPlan.user_define_classpath').text = ''
    
    hashTree2 = ET.SubElement(hashTree, 'hashTree')
    
    # HTTP Request Defaults
    configTestPlan = ET.SubElement(hashTree2, 'ConfigTestElement', guiclass='HttpConfigGui', testclass='ConfigTestElement', testname='HTTP Request Defaults', enabled='true')
    ET.SubElement(configTestPlan, 'stringProp', name='HTTPSampler.domain').text = 'localhost'
    ET.SubElement(configTestPlan, 'stringProp', name='HTTPSampler.port').text = '3000'
    ET.SubElement(configTestPlan, 'stringProp', name='HTTPSampler.protocol').text = 'http'
    ET.SubElement(configTestPlan, 'stringProp', name='HTTPSampler.path').text = '/api'
    ET.SubElement(configTestPlan, 'stringProp', name='HTTPSampler.contentEncoding').text = ''
    ET.SubElement(configTestPlan, 'stringProp', name='HTTPSampler.implementation').text = 'HttpClient4'
    
    hashTree3 = ET.SubElement(hashTree2, 'hashTree')
    
    # Cookie Manager
    cookieManager = ET.SubElement(hashTree3, 'CookieManager', guiclass='CookiePanel', testclass='CookieManager', testname='HTTP Cookie Manager', enabled='true')
    ET.SubElement(cookieManager, 'collectionProp', name='CookieManager.cookies')
    ET.SubElement(cookieManager, 'boolProp', name='CookieManager.clearEachIteration').text = 'false'
    ET.SubElement(cookieManager, 'boolProp', name='CookieManager.controlledByThreadGroup').text = 'false'
    
    hashTree4 = ET.SubElement(hashTree3, 'hashTree')
    
    # Thread Group for Travelers (100 users)
    create_thread_group(hashTree4, 'Travelers', 100, 10, 60, 'Travelers making bookings')
    
    # Thread Group for Owners (20 users)
    create_thread_group(hashTree4, 'Owners', 20, 2, 60, 'Owners responding to bookings')
    
    # Convert to string and prettify
    xml_str = ET.tostring(jmeterTestPlan, encoding='unicode')
    dom = minidom.parseString(xml_str)
    pretty_xml = dom.toprettyxml(indent='  ')
    
    return pretty_xml

def create_thread_group(parent, name, users, ramp_up, duration, comment):
    """Create a thread group with test scenarios"""
    
    threadGroup = ET.SubElement(parent, 'ThreadGroup', guiclass='ThreadGroupGui', testclass='ThreadGroup', testname=name, enabled='true')
    ET.SubElement(threadGroup, 'stringProp', name='ThreadGroup.on_sample_error').text = 'continue'
    ET.SubElement(threadGroup, 'elementProp', name='ThreadGroup.main_controller', elementType='LoopController', guiclass='LoopControllerGui', testclass='LoopController', testname='Loop Controller', enabled='true')
    loopController = threadGroup.find('elementProp')
    ET.SubElement(loopController, 'boolProp', name='LoopController.continue_forever').text = 'false'
    ET.SubElement(loopController, 'stringProp', name='LoopController.loops').text = '-1'
    ET.SubElement(threadGroup, 'stringProp', name='ThreadGroup.num_threads').text = str(users)
    ET.SubElement(threadGroup, 'stringProp', name='ThreadGroup.ramp_time').text = str(ramp_up)
    ET.SubElement(threadGroup, 'boolProp', name='ThreadGroup.scheduler').text = 'true'
    ET.SubElement(threadGroup, 'stringProp', name='ThreadGroup.duration').text = str(duration)
    ET.SubElement(threadGroup, 'stringProp', name='ThreadGroup.delay').text = ''
    ET.SubElement(threadGroup, 'stringProp', name='ThreadGroup.comments').text = comment
    
    hashTree = ET.SubElement(parent, 'hashTree')
    
    if name == 'Travelers':
        # Traveler flow: Login -> Search Properties -> Get Property Details -> Create Booking
        create_login_request(hashTree, 'Traveler Login')
        create_search_properties_request(hashTree, 'Search Properties')
        create_get_property_details_request(hashTree, 'Get Property Details')
        create_create_booking_request(hashTree, 'Create Booking')
        create_get_my_bookings_request(hashTree, 'Get My Bookings')
    else:  # Owners
        # Owner flow: Login -> Get Owner Bookings -> Accept Booking
        create_login_request(hashTree, 'Owner Login')
        create_get_owner_bookings_request(hashTree, 'Get Owner Bookings')
        create_accept_booking_request(hashTree, 'Accept Booking')
    
    return hashTree

def create_login_request(parent, name):
    """Create login HTTP request"""
    httpSampler = ET.SubElement(parent, 'HTTPSamplerProxy', guiclass='HttpTestSampleGui', testclass='HTTPSamplerProxy', testname=name, enabled='true')
    ET.SubElement(httpSampler, 'boolProp', name='HTTPSampler.postBodyRaw').text = 'false'
    ET.SubElement(httpSampler, 'elementProp', name='HTTPsampler.Arguments', elementType='Arguments', guiclass='HTTPArgumentsPanel', testclass='Arguments', testname='User Defined Variables', enabled='true')
    arguments = httpSampler.find('elementProp')
    ET.SubElement(arguments, 'collectionProp', name='Arguments.arguments')
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.domain').text = ''
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.port').text = ''
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.protocol').text = ''
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.path').text = '/auth/login'
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.method').text = 'POST'
    ET.SubElement(httpSampler, 'boolProp', name='HTTPSampler.follow_redirects').text = 'true'
    ET.SubElement(httpSampler, 'boolProp', name='HTTPSampler.auto_redirects').text = 'false'
    ET.SubElement(httpSampler, 'boolProp', name='HTTPSampler.use_keepalive').text = 'true'
    ET.SubElement(httpSampler, 'boolProp', name='HTTPSampler.DO_MULTIPART_POST').text = 'false'
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.embedded_url_re').text = ''
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.connect_timeout').text = ''
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.response_timeout').text = ''
    
    # Header Manager
    hashTree = ET.SubElement(parent, 'hashTree')
    headerManager = ET.SubElement(hashTree, 'HeaderManager', guiclass='HeaderPanel', testclass='HeaderManager', testname='HTTP Header Manager', enabled='true')
    ET.SubElement(headerManager, 'collectionProp', name='HeaderManager.headers')
    header = ET.SubElement(headerManager.find('collectionProp'), 'elementProp', name='', elementType='Header')
    ET.SubElement(header, 'stringProp', name='Header.name').text = 'Content-Type'
    ET.SubElement(header, 'stringProp', name='Header.value').text = 'application/json'
    
    # JSON Body
    hashTree2 = ET.SubElement(hashTree, 'hashTree')
    body = ET.SubElement(hashTree2, 'HTTPSamplerProxy', guiclass='HttpTestSampleGui', testclass='HTTPSamplerProxy', testname='Login Body', enabled='false')
    # Add JSON body data here if needed
    
    return hashTree

def create_search_properties_request(parent, name):
    """Create search properties HTTP request"""
    httpSampler = ET.SubElement(parent, 'HTTPSamplerProxy', guiclass='HttpTestSampleGui', testclass='HTTPSamplerProxy', testname=name, enabled='true')
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.path').text = '/properties/search?location=&startDate=&endDate=&guests=2'
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.method').text = 'GET'
    hashTree = ET.SubElement(parent, 'hashTree')
    return hashTree

def create_get_property_details_request(parent, name):
    """Create get property details HTTP request"""
    httpSampler = ET.SubElement(parent, 'HTTPSamplerProxy', guiclass='HttpTestSampleGui', testclass='HTTPSamplerProxy', testname=name, enabled='true')
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.path').text = '/properties/${propertyId}'
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.method').text = 'GET'
    hashTree = ET.SubElement(parent, 'hashTree')
    return hashTree

def create_create_booking_request(parent, name):
    """Create booking HTTP request"""
    httpSampler = ET.SubElement(parent, 'HTTPSamplerProxy', guiclass='HttpTestSampleGui', testclass='HTTPSamplerProxy', testname=name, enabled='true')
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.path').text = '/bookings'
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.method').text = 'POST'
    hashTree = ET.SubElement(parent, 'hashTree')
    return hashTree

def create_get_my_bookings_request(parent, name):
    """Create get my bookings HTTP request"""
    httpSampler = ET.SubElement(parent, 'HTTPSamplerProxy', guiclass='HttpTestSampleGui', testclass='HTTPSamplerProxy', testname=name, enabled='true')
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.path').text = '/bookings/me'
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.method').text = 'GET'
    hashTree = ET.SubElement(parent, 'hashTree')
    return hashTree

def create_get_owner_bookings_request(parent, name):
    """Create get owner bookings HTTP request"""
    httpSampler = ET.SubElement(parent, 'HTTPSamplerProxy', guiclass='HttpTestSampleGui', testclass='HTTPSamplerProxy', testname=name, enabled='true')
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.path').text = '/bookings/owner'
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.method').text = 'GET'
    hashTree = ET.SubElement(parent, 'hashTree')
    return hashTree

def create_accept_booking_request(parent, name):
    """Create accept booking HTTP request"""
    httpSampler = ET.SubElement(parent, 'HTTPSamplerProxy', guiclass='HttpTestSampleGui', testclass='HTTPSamplerProxy', testname=name, enabled='true')
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.path').text = '/bookings/${bookingId}/accept'
    ET.SubElement(httpSampler, 'stringProp', name='HTTPSampler.method').text = 'POST'
    hashTree = ET.SubElement(parent, 'hashTree')
    return hashTree

if __name__ == '__main__':
    import os
    print("Creating JMeter test plan...")
    xml_content = create_jmeter_test_plan()
    
    # Get absolute path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    plans_dir = os.path.join(script_dir, '..', 'plans')
    os.makedirs(plans_dir, exist_ok=True)
    
    output_file = os.path.join(plans_dir, 'hostly-test-plan.jmx')
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(xml_content)
    
    print(f"✓ Test plan created: {output_file}")
    print("\nNote: This is a basic structure. You may need to refine it in JMeter GUI.")

