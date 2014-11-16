/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.ambari.server.view.configuration;

import org.apache.ambari.view.View;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import java.util.Collections;
import java.util.List;

/**
 * View configuration.
 */
@XmlRootElement(name="view")
@XmlAccessorType(XmlAccessType.FIELD)
public class ViewConfig {
  /**
   * The unique view name.
   */
  private String name;

  /**
   * The public view name.
   */
  private String label;

  /**
   * The view version.
   */
  private String version;

  /**
   * The icon path in the view archive.
   */
  private String icon;

  /**
   * The big icon path in the view archive.
   */
  private String icon64;

  /**
   * The main view class name.
   */
  @XmlElement(name="view-class")
  private String view;

  /**
   * The view class.
   */
  private Class<? extends View> viewClass = null;

  /**
   * The list of view parameters.
   */
  @XmlElement(name="parameter")
  private List<ParameterConfig> parameters;

  /**
   * The list of view resources.
   */
  @XmlElement(name="resource")
  private List<ResourceConfig> resources;

  /**
   * The list of view instances.
   */
  @XmlElement(name="instance")
  private List<InstanceConfig> instances;

  /**
   * The view persistence configuration.
   */
  @XmlElement(name="persistence")
  private PersistenceConfig persistence;

  /**
   * Get the unique name.
   *
   * @return the view name
   */
  public String getName() {
    return name;
  }

  /**
   * Get the public view name.
   *
   * @return the view label
   */
  public String getLabel() {
    return label;
  }

  /**
   * Get the view version.
   *
   * @return the version
   */
  public String getVersion() {
    return version;
  }

  /**
   * Get the icon path in the view archive.
   *
   * @return the icon path
   */
  public String getIcon() {
    return icon;
  }

  /**
   * Get the big icon path in the view archive.
   *
   * @return the big icon path
   */
  public String getIcon64() {
    return icon64;
  }

  /**
   * Get the view class name.
   *
   * @return the view class name
   */
  public String getView() {
    return view;
  }

  /**
   * Get the view class.
   *
   * @param cl  the class loader
   *
   * @return the view class
   *
   * @throws ClassNotFoundException if the class can not be loaded
   */
  public Class<? extends View> getViewClass(ClassLoader cl) throws ClassNotFoundException {
    if (viewClass == null) {
      viewClass = cl.loadClass(view).asSubclass(View.class);
    }
    return viewClass;
  }

  /**
   * Get the list of view parameters.
   *
   * @return the list of parameters
   */
  public List<ParameterConfig> getParameters() {
    return parameters == null ? Collections.<ParameterConfig>emptyList() : parameters;
  }

  /**
   * Get the list of view resources.
   *
   * @return return the list of resources
   */
  public List<ResourceConfig> getResources() {
    return resources == null ? Collections.<ResourceConfig>emptyList() : resources;
  }

  /**
   * Get the list of view instances.
   *
   * @return the list of view instances
   */
  public List<InstanceConfig> getInstances() {
    return instances == null ? Collections.<InstanceConfig>emptyList() : instances;
  }

  /**
   * Get the view persistence configuration.
   *
   * @return the view persistence configuration
   */
  public PersistenceConfig getPersistence() {
    return persistence;
  }
}
